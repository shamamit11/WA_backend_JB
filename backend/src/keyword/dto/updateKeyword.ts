import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateKeywordDto {
    keyword: string;

    @IsOptional()
    @IsNotEmpty()
    reply: string;


    @IsNumber()
    @IsOptional()
    replyAfter: number;
}
