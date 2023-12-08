// whatsapp/whatsapp.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { LocalAuth, Client } from 'whatsapp-web.js';
import { WhatsappGateway } from './whatsapp.gateway';
import { WhatsappMessages } from './entities/whatsapp-messages.entity';
import { User } from 'src/user/entities/user.entity';
import { KeywordService } from 'src/keyword/keyword.service';
import { WhatsAppAccount } from './entities/whatsapp-account.entity';
import { AssignAccountDto } from './dto/AssignAccount.dto';

@Injectable()
export class WhatsappService {
  private clients: { [id: string]: Client } = {};

  constructor(
    @InjectRepository(WhatsappMessages)
    private whatsappMessagesRepository: Repository<WhatsappMessages>,

    @InjectRepository(WhatsAppAccount)
    private readonly accountRepository: Repository<WhatsAppAccount>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private userService: UserService,
    private whatsappGateway: WhatsappGateway,
    private keywordService: KeywordService,
  ) {
    this.initializeAll();
  }

  async createSessionForUser(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error(`User with ID "${userId}" not found`);
    }

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: user.id,
        dataPath: `/usr/src/app/user-data-dir/${user.id}`,
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        handleSIGINT: false,
        executablePath: '/usr/bin/chromium',
      },
      qrMaxRetries: 3,
    });

    client.on('authenticated', async (data) => {
      this.whatsappGateway.sendDirectMessage(user.id, {
        type: 'authentication',
        success: true,
      });
    });

    client.on('qr', (qr) => {
      console.log(qr);
      this.userService.updateWhatsappSession(user.id, false);
      this.whatsappGateway.sendDirectMessage(user.id, {
        type: 'qr',
        sessionId: user.id,
        qr,
      });
    });

    client.on('message', async (msg) => {
      if (msg.type == 'chat') {
        const clientAccount = await this.getWhatsappAccountFromNumber(
          msg.from,
          user,
        );

        const newMessage = this.whatsappMessagesRepository.create();
        newMessage.body = msg.body;
        newMessage.client = clientAccount;
        newMessage.type = 'in';
        newMessage.messageTimestamp = msg.timestamp;
        newMessage.user = user;

        await this.whatsappMessagesRepository.save(newMessage);

        this.whatsappGateway.sendDirectMessage(`${user.id}`, {
          type: 'chat',
          data: newMessage,
        });

        const chat = await msg.getChat();
        if (clientAccount.isAutopilot) {
          chat.sendSeen();
          chat.sendStateTyping();
          this.handleReplies(clientAccount, msg.body, user, msg.to);
          chat.clearState();
        }
      }
    });

    client.on('ready', async () => {
      console.log('Client is ready!');

      this.userService.updateWhatsappSession(user.id, true);
      this.whatsappGateway.sendDirectMessage(user.id, {
        type: 'ready',
        success: true,
      });
    });

    client.on('auth_failure', async () => {
      console.log('Authentication Failed!');
      this.userService.updateWhatsappSession(user.id, false);

      this.whatsappGateway.sendDirectMessage(user.id, {
        type: 'authentication',
        success: false,
      });
    });

    client.on('disconnected', async (data) => {
      console.log('client disconnected!');
      // Close the Puppeteer browser
      if (client.pupBrowser) {
        await client.pupBrowser.close();
      }

      // Update user session and send direct message
      await this.userService.updateWhatsappSession(user.id, false);
      await this.whatsappGateway.sendDirectMessage(user.id, {
        type: 'logout',
        status: true,
      });
    });

    client.initialize().catch((e) => console.log(e));

    this.clients[user.id] = client;
  }

  getClient(id: string): Client {
    return this.clients[id];
  }

  cleanNumbers(id: string) {
    return id.split('@')[0];
  }

  wfyNumbers(number: string) {
    if (!number.endsWith('@c.us')) {
      return number + '@c.us';
    }
    return number;
  }

  async handleReplies(
    client: WhatsAppAccount,
    body: string,
    user: User,
    to: string,
  ) {
    let kr = await this.keywordService.getReply(body);
    let reply = kr?.reply;
    if (!reply) {
      reply =
        "I couldn't understand your query. Our customer support representative will connect with you in a moment.";
    }

    setTimeout(
      () => this.sendMessage(user, client, reply),
      kr?.replyAfter * 1000,
    );
  }

  async sendMessage(user: User, to: WhatsAppAccount, message: string) {
    const client = this.getClient(user.id);

    if (user.activeWhatsappSession === true) {
      if (client) {
        const newMessage = await this.whatsappMessagesRepository.create();
        newMessage.body = message;
        newMessage.type = 'out';
        newMessage.messageTimestamp = 12345;
        newMessage.user = user;
        newMessage.client = to;

        await this.whatsappMessagesRepository
          .save(newMessage)
          .catch((c) => console.log(c));

        this.whatsappGateway.sendDirectMessage(user.id, {
          type: 'chat',
          data: newMessage,
        });

        return await client.sendMessage(this.wfyNumbers(to.phone), message);
      } else {
        throw new NotFoundException('Session not found or not connected');
      }
    }
  }

  async getMessages(id: string, accountId) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} Not Found!`);
    }

    const account = await this.accountRepository.findOne({
      where: {
        owner: {
          id: id,
        },
        id: accountId,
      },
    });

    if (!account) {
      throw new NotFoundException(`Acount with id ${accountId} Not Found!`);
    }

    return await this.whatsappMessagesRepository.find({
      where: {
        user: user,
        client: account,
      },
    });
  }

  async initializeAll() {
    const users = await this.userService.usersWithActiveSesssions();

    if (users.length > 0) {
      users.forEach((user) =>
        this.createSessionForUser(user.id).then(() =>
          console.log('Initialized for user', user.id),
        ),
      );
    }
  }

  async createWhatsappAccount(
    accountData: Partial<WhatsAppAccount>,
  ): Promise<WhatsAppAccount> {
    const account = this.accountRepository.create(accountData);
    return this.accountRepository.save(account);
  }

  async getWhatsappAccountFromNumber(
    phone: string,
    owner: User,
  ): Promise<WhatsAppAccount> {
    let account = await this.accountRepository.findOne({
      where: { phone: this.cleanNumbers(phone), owner: { id: owner.id } },
    });
    console.log('get whatsapp accoumt', account);
    if (account === null) {
      // Create a new record for the sender if they don't exist
      account = new WhatsAppAccount();
      account.phone = this.cleanNumbers(phone);
      account.owner = owner;
      await this.accountRepository.save(account);
      console.log('get whatsapp account after creating account', account);
    }

    return account;
  }

  async getClients(id: string) {
    return await this.accountRepository.find({
      where: {
        owner: { id: id },
      },
    });
  }

  async getAgentsAndContacts() {
    const agents = await this.userService.getAgents();

    const agentsAndContacts = await agents.map(async (agent) => {
      const contacts = await this.accountRepository.find({
        where: {
          owner: agent,
        },
      });
      agent.contacts = await contacts;
      return agent;
    });

    return await Promise.all(agentsAndContacts);
  }

  async getAgentAndContacts(agentId: string) {
    const agent = await this.userService.findOne(agentId);
    const contacts = await this.accountRepository.find({
      where: {
        owner: agent,
      },
    });
    agent.contacts = contacts;

    return agent;
  }

  async getAgentMessages(agentId: string, whatsappAccountId: string) {
    const agent = await this.userService.findOne(agentId);

    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found!`);
    }

    const whatsappAccount = await this.accountRepository.findBy({
      id: whatsappAccountId,
    });

    if (!whatsappAccount) {
      throw new NotFoundException(
        `Whatsapp Account with ID ${whatsappAccountId} not found!`,
      );
    }

    const whatsappMessages = await this.whatsappMessagesRepository.find({
      where: {
        user: agent,
        client: whatsappAccount,
      },
    });

    return whatsappMessages;
  }

  async updateAutopilot(userId: string, accountId: string, status: boolean) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const account = await this.accountRepository.findOneBy({
      owner: user,
      id: accountId,
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    account.isAutopilot = status;
    return this.accountRepository.save(account);
  }

  async getAll(): Promise<WhatsAppAccount[]> {
    const accounts = await this.accountRepository.find({});

    const accountAndContacts = await accounts.map(async (account) => {
      const contacts = await this.usersRepository.findOne({
        where: {
          id: account.ownerId,
        },
      });
      if (account.ownerId != null) {
        account.owner = await contacts;
      }
      return account;
    });

    return await Promise.all(accountAndContacts);
  }

  async delete(id: string): Promise<void> {
    const result = await this.accountRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Account with ID ${id} not found.`);
    }
  }

  async updateAssignAccount(
    id: string,
    assignAccountDto: AssignAccountDto,
  ): Promise<WhatsAppAccount> {
    const whatsAppAccount = await this.accountRepository.preload({
      id: id,
      ...assignAccountDto,
    });

    if (!whatsAppAccount) {
      throw new NotFoundException(`Keyword with ID ${id} not found`);
    }
    //const updatedKeywordReply = this.accountRepository.merge(whatsAppAccount, assignAccountDto);
    return this.accountRepository.save(whatsAppAccount);
  }
}
