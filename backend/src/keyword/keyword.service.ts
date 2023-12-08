// src/keyword-reply/keyword-reply.service.ts

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keyword } from './entities/keyword.entity';
import { SetKeywordDto } from './dto/setKeyword.dto';
import { UpdateKeywordDto } from './dto/updateKeyword';

@Injectable()
export class KeywordService {
    constructor (
        @InjectRepository(Keyword)
        private keywordRepository: Repository<Keyword>,
    ) { }

    async setKeyword (setKeywordDto: SetKeywordDto) {
        const existingKeyword = await this.keywordRepository.findOneBy({ keyword: setKeywordDto.keyword });

        if (existingKeyword) {
            throw new ConflictException(`Keyword '${ setKeywordDto.keyword }' already exists1111`);
        }

        const keywordReply = this.keywordRepository.create(setKeywordDto);
        return await this.keywordRepository.save(keywordReply);
    }

    async updateKeyword (id: string, updateKeywordDto: UpdateKeywordDto) {
        const keywordReply = await this.keywordRepository.preload({id: id, ...updateKeywordDto});

        if (!keywordReply) {
            throw new NotFoundException(`Keyword with ID ${ id } not found`);
        }
        if (updateKeywordDto.keyword){
            const existingKeyword = await this.keywordRepository.findOneBy({ keyword: updateKeywordDto.keyword });
    
            if (existingKeyword) {
                throw new ConflictException(`Keyword '${ updateKeywordDto.keyword }' already exists`);
            }

        }

        const updatedKeywordReply = this.keywordRepository.merge(keywordReply, updateKeywordDto);
        return this.keywordRepository.save(updatedKeywordReply);
    }

    async findAll (): Promise<Keyword[]> {
        return this.keywordRepository.find({});
    }

    async getReply (message: string) {
        const keywords = await this.findAll();

        for (const kr of keywords) {
            if (message.includes(kr.keyword)) {
                // If the message includes the keyword, send the associated reply
                return kr;
                break;
            }
        }
    }

    async delete (id: string): Promise<void> {
        const result = await this.keywordRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Keyword with ID ${ id } not found.`);
        }
    }
}
