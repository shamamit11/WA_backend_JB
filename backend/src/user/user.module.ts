import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [ TypeOrmModule.forFeature([ User, UserRepository ]), MailModule ],
  providers: [ UserService ],
  controllers: [ UserController ],
  exports: [ TypeOrmModule, UserService ], // export TypeOrmModule

})
export class UserModule { }