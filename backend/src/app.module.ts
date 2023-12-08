import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { config } from './common/constants/config';
import { typeOrmConfig } from './common/typeorm/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { KeywordModule } from './keyword/keyword.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
    AuthModule,
    KeywordModule,
    WhatsappModule
  ],
  controllers: [ AppController ],
  providers: [ AppService ],
})
export class AppModule { }
