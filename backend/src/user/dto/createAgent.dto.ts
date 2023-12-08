import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';


export class CreateAgentDto {

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsOptional()
    middleName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class UserLoginDto {
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
}