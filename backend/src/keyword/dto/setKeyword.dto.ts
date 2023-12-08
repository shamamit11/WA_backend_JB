import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SetKeywordDto {
    @IsString()
    @IsNotEmpty()
    keyword: string;

    @IsString()
    @IsNotEmpty()
    reply: string;

    @IsNumber()
    replyAfter: number;
}
