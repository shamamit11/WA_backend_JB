import { Controller, Post, Body, UseGuards, ValidationPipe, UsePipes, Put, Param, Get, Delete, NotFoundException, HttpException, ConflictException } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { SetKeywordDto } from './dto/setKeyword.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { HTTP_STATUS } from 'src/common/constants/status';
import { UpdateKeywordDto } from './dto/updateKeyword';


@Controller('keyword')
export class KeywordController {
    constructor (private readonly keywordReplyService: KeywordService) { }

    @Post('set')
    @UsePipes(new ValidationPipe({ transform: true }))
    async setKeyword (@Body() setKeywordDto: SetKeywordDto) {
        try {
            const data = await this.keywordReplyService.setKeyword(setKeywordDto);
            return { statusCode: HTTP_STATUS.CREATED, data, message: "Keyword Created!" };

        } catch (err) {

            if (err instanceof ConflictException) {
                throw new ConflictException({ statusCode: err.getStatus(), message: err.message });

            }

            throw new HttpException({
                statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                message: 'Unexpected error', error: err.response

            }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    @Put(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateKeyword (@Param('id') id: string, @Body() updateKeywordDto: UpdateKeywordDto) {
        try {
            const data = await this.keywordReplyService.updateKeyword(id, updateKeywordDto);
            return { statusCode: HTTP_STATUS.OK, data, message: "Keyword Updated!" };
        } catch (err) {

            if (err instanceof ConflictException) {
                throw new NotFoundException({ statusCode: err.getStatus(), message: err.message });

            }

            if (err instanceof NotFoundException) {
                throw new NotFoundException({ statusCode: HTTP_STATUS.NOT_FOUND, message: err.message });
            }

            throw new HttpException({ statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Unexpected error!' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    @UsePipes(new ValidationPipe({ transform: true }))
    async getAll () {
        try {
            const data = await this.keywordReplyService.findAll();
            return { statusCode: HTTP_STATUS.OK, data };
        } catch (err) {
            throw new HttpException({ statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Unexpected error' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }


    @Delete(':id')
    async deleteKeyword (@Param('id') id: string) {
        try {
            await this.keywordReplyService.delete(id);
            return { statusCode: HTTP_STATUS.OK, message: "Successfully deleted" };
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw new NotFoundException({ statusCode: HTTP_STATUS.NOT_FOUND, message: err.message });
            }
            throw new HttpException({ statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Unexpected error', error: err }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
}
