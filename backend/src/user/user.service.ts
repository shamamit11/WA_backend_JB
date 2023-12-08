import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { USER_ROLE, User } from './entities/user.entity';
import { CreateUserDto, UserLoginDto } from './dto/user.dto';
import { compare, hash } from 'bcryptjs';
import { UserRepository } from './repositories/user.repository';
import { UpdateUserDto } from './dto/updateUser.dto';
import { CreateAgentDto } from './dto/createAgent.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {
    constructor (
        @InjectRepository(User)
        private readonly usersRepository: UserRepository,
        private mailService: MailService
    ) { }

    async create (createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await hash(createUserDto.password, 10);
        const user = this.usersRepository.create({ ...createUserDto, password: hashedPassword });
        return this.usersRepository.save(user);
    }

    async findOne (id: string): Promise<User> {
        return this.usersRepository.findOneBy({
            id: id
        });
    }

    async findOneByEmail (email: string): Promise<User> {
        return this.usersRepository.findOneBy({
            email: email
        });
    }

    async validateUser (userLoginDto: UserLoginDto): Promise<User> {
        const { email, password } = userLoginDto;
        const user = await this.usersRepository.findOneBy({ email: email });
        if (user && (await compare(password, user.password))) {
            return user;
        }
        return null;
    }

    async updateUser (id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.usersRepository.preload({ id: id, ...updateUserDto });
        if (!user) {
            throw new NotFoundException(`User with ID ${ id } not found`);
        }
        if (updateUserDto.email) {
            const existingUser = await this.usersRepository.findOneBy({ email: updateUserDto.email });


            if (existingUser) {
                throw new ConflictException(`User with email '${ updateUserDto.email }' already exists`);
            }
        }

        return this.usersRepository.save(user);
    }

    async updateWhatsappSession (id: string, status: boolean) {
        const user = await this.usersRepository.preload({ id: id });
        if (!user) {
            throw new NotFoundException(`User with ID ${ id } not found`);
        }
        user.activeWhatsappSession = status;
        this.usersRepository.save(user);

    }

    async getAgents (): Promise<User[]> {
        return await this.usersRepository.findBy({ role: USER_ROLE.AGENT });
    }

    async createAgent (createAgentDto: CreateAgentDto): Promise<User> {

        const existingAgent = await this.usersRepository.findOneBy({ email: createAgentDto.email });

        if (existingAgent) {
            throw new ConflictException(`User with email '${ createAgentDto.email }' already exists`);
        }


        const password = createAgentDto.password;
        const hashedPassword = await hash(password, 10);
        const user = await this.usersRepository.create({ ...createAgentDto, password: hashedPassword, role: USER_ROLE.AGENT });
        const data = this.usersRepository.save(user);


        var mailOptions = {
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: 'Agent Account Credentials',
            text: 'password : ' + password,
        };
        try {
            await this.mailService.sendMail(mailOptions);
        } catch (err) {
            console.log(err);
        }


        return data;


    }

    async usersWithActiveSesssions () {
        return this.usersRepository.findBy({ activeWhatsappSession: true });
    }

    async deleteAgent (id: string): Promise<void> {
        const result = await this.usersRepository.delete(id);
        
        if (result.affected === 0) {
            throw new NotFoundException(`Agent with ID ${ id } not found.`);
        }
    }
}