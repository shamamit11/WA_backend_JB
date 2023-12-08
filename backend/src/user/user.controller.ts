import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  Get,
  Request,
  UseGuards,
  Put,
  Param,
  ConflictException,
  HttpException,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';
import { CreateAgentDto } from './dto/createAgent.dto';
import { HTTP_STATUS } from 'src/common/constants/status';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userService.create(createUserDto);
    return user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMe(@Request() request) {
    try {
      const { id } = request.user;
      const user = await this.userService.findOne(id);

      return { statusCode: HTTP_STATUS.OK, data: user };
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
          error: err.response,
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMe(@Body() updateUserDto: UpdateUserDto, @Request() request) {
    try {
      const { id } = request.user;
      const data = await this.userService.updateUser(id, updateUserDto);
      return { statusCode: HTTP_STATUS.OK, data, message: 'Profile Updated!' };
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

  @Post('agent')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createAgent(@Body() createAgentDto: CreateAgentDto) {
    try {
      const data = await this.userService.createAgent(createAgentDto);
      return {
        statusCode: HTTP_STATUS.CREATED,
        data,
        message: 'User Created!',
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

  @Put('agent/:id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async editAgent(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
  ) {
    try {
      const data = await this.userService.updateUser(id, updateUserDto);
      return {
        statusCode: HTTP_STATUS.OK,
        data: data,
        message: 'Agent Updated!',
      };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw new ConflictException({
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
          message: 'Unexpected error',
          error: err.response,
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('agents')
  @UseGuards(JwtAuthGuard)
  async getAgents() {
    try {
      const data = await this.userService.getAgents();
      return { statusCode: HTTP_STATUS.OK, data };
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

  @Delete('agent/:id')
  async deleteKeyword(@Param('id') id: string) {
    try {
      await this.userService.deleteAgent(id);
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
          error: err.message,
        },
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
