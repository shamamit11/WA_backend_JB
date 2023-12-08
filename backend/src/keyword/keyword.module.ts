import { Module } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { KeywordController } from './keyword.controller';
import { Keyword } from './entities/keyword.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ TypeOrmModule.forFeature([ Keyword ]) ],
  providers: [ KeywordService ],
  controllers: [ KeywordController ],
  exports: [KeywordService]
})
export class KeywordModule { }
