import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import envConfig from '../config';
import { TokenPayload } from '../types/jwt.type';

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) { }

    signAccessToken(payload: { userId: number, roleId?: number, verify?: number }) {
        return this.jwtService.sign(payload, {
            secret: envConfig.ACCESS_TOKEN_SECRET,
            expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
            algorithm: 'HS256',
        });
    }

    signRefreshToken(payload: { userId: number, roleId?: number }) {
        return this.jwtService.sign(payload, {
            secret: envConfig.REFRESH_TOKEN_SECRET,
            expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
            algorithm: 'HS256',
        });
    }

    signAccessAndRefreshToken(payload: { userId: number, roleId?: number, verify: number }) {
        return Promise.all([
            this.signAccessToken(payload),
            this.signRefreshToken(payload)
        ]);
    }

    decodeRefreshToken(refresh_token: string) {
        return this.verifyRefreshToken(refresh_token)
    }

    decodeAccessToken(access_token: string) {
        return this.verifyAccessToken(access_token)
    }

    async verifyAccessToken(token: string): Promise<TokenPayload> {
        try {
            if (!token) {
                throw new UnauthorizedException('Token is required');
            }

            const decoded = await this.jwtService.verifyAsync<TokenPayload>(token, {
                secret: envConfig.ACCESS_TOKEN_SECRET,
                algorithms: ['HS256']
            });

            if (!decoded || !decoded.userId) {
                throw new UnauthorizedException('Invalid token format');
            }

            return decoded;
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid token signature');
            }
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token has expired');
            }
            throw new UnauthorizedException('Invalid token');
        }
    }

    async verifyRefreshToken(token: string): Promise<TokenPayload> {
        try {
            if (!token) {
                throw new UnauthorizedException('Refresh token is required');
            }

            const decoded = await this.jwtService.verifyAsync(token, {
                secret: envConfig.REFRESH_TOKEN_SECRET,
                algorithms: ['HS256']
            });

            if (!decoded) {
                throw new UnauthorizedException('Invalid refresh token format');
            }

            return decoded;
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid refresh token signature');
            }
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Refresh token has expired');
            }
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
