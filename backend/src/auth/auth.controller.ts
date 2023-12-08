import { Controller, Request, Post, UseGuards, Body, UsePipes, ValidationPipe, Param, UnauthorizedException, NotFoundException, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { HTTP_STATUS } from 'src/common/constants/status';
import { compare, hash } from 'bcryptjs';

@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) { }

    @Post('login')
    @UseGuards(AuthGuard('local'))
    async login (@Body() loginDto: LoginDto) {
        try {
            const data = await this.authService.login(loginDto);
            return { statusCode: HTTP_STATUS.OK, data: data, message: "User Login Successful!" };
        } catch (err) {
            if (err instanceof UnauthorizedException) {
                throw new UnauthorizedException({ statusCode: HTTP_STATUS.UNAUTHORIZED, message: err.message });

            }

            if (err instanceof NotFoundException) {
                throw new NotFoundException({ statusCode: HTTP_STATUS.NOT_FOUND, message: err.message });
            }

            throw new HttpException({ statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Unexpected error!' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

    }


    @Post('signup')
    @UsePipes(new ValidationPipe({ transform: true }))
    async create (@Body() createUserDto: CreateUserDto): Promise<any> {
        const user = await this.authService.signup(createUserDto);
        return user;
    }

    @Post('change/password')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async changePassword (@Body() changePasswordDto: ChangePasswordDto, @Request() request) {
        try {
            const user = request.user;
            await this.authService.changePassword(user.email, changePasswordDto);

            return { statusCode: HTTP_STATUS.OK, message: 'Password Changed Successfuly' };

        } catch (err) {

            if (err instanceof UnauthorizedException) {
                throw new UnauthorizedException({ statusCode: HTTP_STATUS.UNAUTHORIZED, message: err.message });

            }

            if (err instanceof NotFoundException) {
                throw new NotFoundException({ statusCode: HTTP_STATUS.NOT_FOUND, message: err.message });
            }

            throw new HttpException({ statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Unexpected error!' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('forgot/password')
    @UsePipes(new ValidationPipe({ transform: true }))
    async forgotPassword (@Body() forgotPasswordDto: ForgotPasswordDto) {
        try {
            const { email } = forgotPasswordDto;
            const resetToken = await this.authService.sendForgotPasswordEmail(email);
            return { statusCode: HTTP_STATUS.OK, data: resetToken, message: "Password reset link has been sent to " + email };

        } catch (err) {

            if (err instanceof UnauthorizedException) {
                throw new UnauthorizedException({ statusCode: HTTP_STATUS.UNAUTHORIZED, message: err.message });

            }

            if (err instanceof NotFoundException) {
                throw new NotFoundException({ statusCode: HTTP_STATUS.NOT_FOUND, message: err.message });
            }

            throw new HttpException({ statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Unexpected error!' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('reset/password/:token')
    @UsePipes(new ValidationPipe({ transform: true }))
    async resetPassword (
        @Param('token') token: string,
        @Body() resetPasswordDto: ResetPasswordDto,
    ) {
        try {
            await this.authService.resetPassword(token, resetPasswordDto.newPassword);
            return { statusCode: HTTP_STATUS.OK, message: "Password Changed Successfully" };
        } catch (err) {

            if (err instanceof UnauthorizedException) {
                throw new UnauthorizedException({ statusCode: HTTP_STATUS.UNAUTHORIZED, message: err.message });

            }

            if (err instanceof NotFoundException) {
                throw new NotFoundException({ statusCode: HTTP_STATUS.NOT_FOUND, message: err.message });
            }

            throw new HttpException({ statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: 'Unexpected error!' }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
}

