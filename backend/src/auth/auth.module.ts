import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

import { User } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { MailModule } from 'src/mail/mail.module';
import { config } from 'src/common/constants/config';


@Module({
  imports: [
    JwtModule.register({
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
    TypeOrmModule.forFeature([ User, UserRepository ]),
    MailModule
  ],
  providers: [ AuthService, LocalStrategy, JwtStrategy, UserService ],
  controllers: [ AuthController ],
})
export class AuthModule { }