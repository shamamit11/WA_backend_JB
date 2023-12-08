// whatsapp/whatsapp.controller.ts

import {
  Controller,
  Post,
  Param,
  Request,
  UseGuards,
  Get,
  ConflictException,
  NotFoundException,
  HttpException,
  Body,
  UsePipes,
  ValidationPipe,
  Delete,
  Put,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { HTTP_STATUS } from 'src/common/constants/status';
import { SendMessageDto } from './dto/sendMessage.dto';
import { UserService } from 'src/user/user.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { SetWhatsappAccountsDto } from './dto/setWhatsappAccounts.dto';
import { AssignAccountDto } from './dto/AssignAccount.dto';

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly userService: UserService,
  ) {}

  @Post('create-session')
  @UseGuards(JwtAuthGuard)
  createSessionForUser(@Request() request) {
    const { id } = request.user;

    return this.whatsappService.createSessionForUser(id);
  }

  @Get('messages/:accountId')
  @UseGuards(JwtAuthGuard)
  async getMessages(@Request() request, @Param('accountId') accountId: string) {
    try {
      const { id } = request.user;

      const data = await this.whatsappService.getMessages(id, accountId);

      return { statusCode: HTTP_STATUS.OK, data };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new NotFoundException({
          statusCode: err.getStatus(),
          message: err.message,
        });
      }

      if (err instanceof NotFoundException) {
        throw new NotFoundException({
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: err.message,
        });
      }
      console.log(err);
      throw new HttpException(
        {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error!',
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('contacts')
  @UseGuards(JwtAuthGuard)
  async getContacts(@Request() request) {
    try {
      const { id } = request.user;

      const data = await this.whatsappService.getClients(id);
      return { statusCode: HTTP_STATUS.OK, data };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new NotFoundException({
          statusCode: err.getStatus(),
          message: err.message,
        });
      }

      if (err instanceof NotFoundException) {
        throw new NotFoundException({
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: err.message,
        });
      }

      throw new HttpException(
        {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error!',
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send_message/')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Request() request,
  ) {
    try {
      const { id } = request.user;

      const user = await this.userService.findOne(id);
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found!`);
      }
      const clientAccount =
        await this.whatsappService.getWhatsappAccountFromNumber(
          sendMessageDto.id,
          user,
        );
      const data = await this.whatsappService.sendMessage(
        user,
        clientAccount,
        sendMessageDto.text,
      );
      return { statusCode: HTTP_STATUS.OK };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new NotFoundException({
          statusCode: err.getStatus(),
          message: err.message,
        });
      }

      if (err instanceof NotFoundException) {
        throw new NotFoundException({
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: err.message,
        });
      }
      console.log(err);
      throw new HttpException(
        {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error!',
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/admin/contacts')
  @UseGuards(JwtAuthGuard)
  async agentsWithContacts() {
    try {
      const data = await this.whatsappService.getAgentsAndContacts();
      return { statusCode: HTTP_STATUS.OK, data };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new NotFoundException({
          statusCode: err.getStatus(),
          message: err.message,
        });
      }

      if (err instanceof NotFoundException) {
        throw new NotFoundException({
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: err.message,
        });
      }
      console.log(err);
      throw new HttpException(
        {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error!',
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/admin/agentcontacts')
  @UseGuards(JwtAuthGuard)
  async agentWithContacts(@Request() request) {
    try {
      const { id } = request.user;
      const data = await this.whatsappService.getAgentAndContacts(id);
      return { statusCode: HTTP_STATUS.OK, data };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new NotFoundException({
          statusCode: err.getStatus(),
          message: err.message,
        });
      }

      if (err instanceof NotFoundException) {
        throw new NotFoundException({
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: err.message,
        });
      }
      console.log(err);
      throw new HttpException(
        {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error!',
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/agent/messages/:agentId/:whatsappAccountId')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAgentMessages(
    @Param('agentId') agentId: string,
    @Param('whatsappAccountId') whatsappAccountId: string,
  ) {
    try {
      const data = await this.whatsappService.getAgentMessages(
        agentId,
        whatsappAccountId,
      );
      return { statusCode: HTTP_STATUS.OK, data };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new NotFoundException({
          statusCode: err.getStatus(),
          message: err.message,
        });
      }

      if (err instanceof NotFoundException) {
        throw new NotFoundException({
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: err.message,
        });
      }
      console.log(err);
      throw new HttpException(
        {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error!',
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('autopilot/:accountId')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateAccountAutopilot(
    @Param('accountId') accountId: string,
    @Request() request,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    try {
      const { id } = request.user;

      const data = await this.whatsappService.updateAutopilot(
        id,
        accountId,
        updateAccountDto.status,
      );

      return { statusCode: HTTP_STATUS.OK, data };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new NotFoundException({
          statusCode: err.getStatus(),
          message: err.message,
        });
      }

      if (err instanceof NotFoundException) {
        throw new NotFoundException({
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: err.message,
        });
      }
      console.log(err);
      throw new HttpException(
        {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error!',
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('getall')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAll() {
    try {
      const data = await this.whatsappService.getAll();
      return { statusCode: HTTP_STATUS.OK, data };
    } catch (err) {
      throw new HttpException(
        {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error',
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('set')
  @UsePipes(new ValidationPipe({ transform: true }))
  async setWhatsappAccount(
    @Body() setWhatsappAccountsDto: SetWhatsappAccountsDto,
  ) {
    try {
      const data = await this.whatsappService.createWhatsappAccount(
        setWhatsappAccountsDto,
      );
      return {
        statusCode: HTTP_STATUS.CREATED,
        data,
        message: 'Account Registered!',
      };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new ConflictException({
          statusCode: err.getStatus(),
          message: err.message,
        });
      }

      throw new HttpException(
        {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error',
          error: err.response,
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteKeyword(@Param('id') id: string) {
    try {
      await this.whatsappService.delete(id);
      return { statusCode: HTTP_STATUS.OK, message: 'Successfully deleted' };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException({
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: err.message,
        });
      }
      throw new HttpException(
        {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error',
          error: err,
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateAssignAccount(
    @Param('id') id: string,
    @Body() assignAccountDto: AssignAccountDto,
  ) {
    try {
      const data = await this.whatsappService.updateAssignAccount(
        id,
        assignAccountDto,
      );
      return { statusCode: HTTP_STATUS.OK, data, message: 'Account Assigned!' };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new NotFoundException({
          statusCode: err.getStatus(),
          message: err.message,
        });
      }

      if (err instanceof NotFoundException) {
        throw new NotFoundException({
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: err.message,
        });
      }

      throw new HttpException(
        {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Unexpected error!',
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
