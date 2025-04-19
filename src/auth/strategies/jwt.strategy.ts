import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: any) => {
                    if (request?.handshake?.auth?.token) {
                        return request.handshake.auth.token.replace('Bearer ', '');
                    }
                    if (request?.headers?.authorization) {
                        return request.headers.authorization.replace('Bearer ', '');
                    }
                    return null;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'defaultSecretKey',
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, username: payload.username };
    }
}