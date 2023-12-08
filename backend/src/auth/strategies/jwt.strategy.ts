import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'src/common/constants/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor (
        private userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: config.JWT_SECRET,
        });
    }

    async validate (payload: any) {
        const { email } = payload.user;

        const user = await this.userService.findOneByEmail(email);

        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}