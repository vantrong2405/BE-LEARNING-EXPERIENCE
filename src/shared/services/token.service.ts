import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import envConfig from '../config';
import { TokenPayload } from '../types/jwt.type';

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) { }

    signAccessToken(payload: { userId: number }) {
        return this.jwtService.sign(payload, {
            secret: envConfig.ACCESS_TOKEN_SECRET,
            expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
            algorithm: 'HS256',
        });
    }

    signRefreshToken(payload: { userId: number }) {
        return this.jwtService.sign(payload, {
            secret: envConfig.REFRESH_TOKEN_SECRET,
            expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
            algorithm: 'HS256',
        });
    }

    signAccessAndRefreshToken(payload: { userId: number, verify: number }) {
        return Promise.all([
            this.signAccessToken(payload),
            this.signRefreshToken(payload)
        ]);
    }

    decodeRefreshToken(refresh_token: string) {
        return this.verifyRefreshToken(refresh_token)
    }

    verifyAccessToken(token: string): Promise<TokenPayload> {
        return this.jwtService.verifyAsync(token, {
            secret: envConfig.ACCESS_TOKEN_SECRET,
        });
    }

    verifyRefreshToken(token: string): Promise<TokenPayload> {
        return this.jwtService.verifyAsync(token, {
            secret: envConfig.REFRESH_TOKEN_SECRET,
        });
    }
}
