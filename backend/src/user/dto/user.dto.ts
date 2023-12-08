import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { USER_ROLE } from '../entities/user.entity';

export class CreateUserDto {

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
    @MinLength(8)
    password: string;

}

export class UserLoginDto {
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
}