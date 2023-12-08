import { IsString } from 'class-validator';

export class SetWhatsappAccountsDto {
    //id: string;

    @IsString()
    phone: string;

    @IsString()
    name: string;

    isAutopilot: boolean

    @IsString()
    code: string;

    @IsString()
    port: string;

    @IsString()
    status: string;
}