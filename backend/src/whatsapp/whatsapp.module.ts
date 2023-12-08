// whatsapp/whatsapp.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { UserModule } from 'src/user/user.module';
import { WhatsappGateway } from './whatsapp.gateway';
import { WhatsappMessages } from './entities/whatsapp-messages.entity';
import { KeywordModule } from 'src/keyword/keyword.module';
import { WhatsAppAccount } from './entities/whatsapp-account.entity';

@Module({
  imports: [ TypeOrmModule.forFeature([ WhatsappMessages, WhatsAppAccount ]), UserModule, KeywordModule],
  controllers: [ WhatsappController ],
  providers: [ WhatsappService, WhatsappGateway ],
  exports: [ WhatsappService ],
})
export class WhatsappModule { }
