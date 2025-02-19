import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { LoginBodyDTO, RegisterBodyDTO } from './auth.dto';
import { TokenService } from 'src/shared/services/token.service';
import { isNotFoundPrismaError, isUniqueConstrainError } from 'src/shared/helpers';
import { generateUsername } from 'src/utils/helpers';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import envConfig from 'src/shared/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly haShingService: HashingService,
        private readonly prismaService: PrismaService,
        private readonly tokenService: TokenService
    ) { }
    async register(body: RegisterBodyDTO) {
        try {
            const hashedPassword = await this.haShingService.hash(body.password)
            const dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
            const user = await this.prismaService.user.create({
                data: {
                    name: body.name,
                    username: generateUsername(body.name),
                    email: body.email,
                    password: hashedPassword,
                    dateOfBirth: dateOfBirth,
                    roleId: body.roleId
                } as Prisma.UserUncheckedCreateInput,
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    dateOfBirth: true,
                    roleId: true,
                    createdAt: true,
                },
            })
            return {
                user,
                message: 'Register success'
            }
        } catch (error) {
            console.log("🚀 ~ AuthService ~ register ~ error:", error)
            if (isUniqueConstrainError(error)) {
                throw new ConflictException('Email already exists')
            }
            throw error
        }
    }

    async login(body: LoginBodyDTO) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: body.email
            }
        })

        if (!user) {
            throw new UnauthorizedException('Email not found')
        }

        const isPasswordMatch = await this.haShingService.compare(body.password, user.password)
        if (!isPasswordMatch) {
            throw new UnauthorizedException([
                {
                    field: 'password',
                    error: 'Password is incorrect'
                }
            ])
        }
        const tokens = await this.generateTokens({ userId: user.id })
        return tokens
    }

    async generateTokens(payload: { userId: number }) {
        const [accessToken, refreshToken] = await Promise.all([
            this.tokenService.signAccessToken(payload),
            this.tokenService.signRefreshToken(payload)
        ])

        // khi giải mã thì nó sẽ trả về 1 object data người khi đăng ký lúc đầu là userId + thêm 2 field tự jwt tự tạo là exp và iat
        const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)

        await this.prismaService.refreshToken.create({
            data: {
                token: refreshToken,
                userId: payload.userId,
                expiresAt: new Date(decodedRefreshToken.exp * 1000)
            }
        })
        return { accessToken, refreshToken }
    }

    async refreshToken(refreshToken: string) {
        try {
            // 1. Kiểm tra refreshToken có hợp lệ không
            const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);

            // 2. Kiểm tra refreshToken có tồn tại trong database không
            await this.prismaService.refreshToken.findUniqueOrThrow({
                where: {
                    token: refreshToken
                }
            });

            // 3. Xóa refreshToken cũ
            await this.prismaService.refreshToken.delete({
                where: {
                    token: refreshToken
                }
            });

            // 4. Tạo mới accessToken và refreshToken
            return await this.generateTokens({ userId });

        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw new UnauthorizedException('Refresh token has been revoked')
            }
            throw new UnauthorizedException()

        }
    }

    async logout(refreshToken: string) {
        try {
            // 1. Kiểm tra refreshToken có hợp lệ không
            await this.tokenService.verifyRefreshToken(refreshToken);
            // 2. Xoas refreshToken trong database không
            await this.prismaService.refreshToken.delete({
                where: {
                    token: refreshToken
                }
            });
            return { message: 'Logout success' }
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw new UnauthorizedException('Refresh token has been revoked')
            }
            throw new UnauthorizedException()

        }
    }

    async oauth(code: string) {
        const { id_token, access_token } = await this.getOauthGoogleToken(code)
        const userInfo = await this.getGoogleUserInfo(access_token, id_token)
        if (!userInfo.email_verified) {
            throw new ConflictException('Email already exists')
        }

        const user = await this.prismaService.user.findUnique({
            where: {
                email: userInfo.email as string
            }
        })

        if (user) {
            const [access_token, refresh_token] = await this.tokenService.signAccessAndRefreshToken(
                { userId: user.id, verify: 1 }
            )
            const { iat, exp } = await this.tokenService.decodeRefreshToken(refresh_token)
            await this.prismaService.refreshToken.update({
                where: {
                    userId: user.id,
                    expiresAt: new Date(exp * 1000),
                    token: refresh_token,
                    createdAt: new Date(iat * 1000)
                },
                data: {
                    token: refresh_token
                }
            })

            return {
                access_token,
                refresh_token,
                newUser: 0,// chưa có user thì user = 0 
                verify: user.verify
            }
        } else {
            const passwordRandom = Math.random().toString(36).substring(2, 15)
            const data = await this.register({
                name: userInfo.email,
                email: userInfo.email,
                password: passwordRandom,
                dateOfBirth: new Date(),
                confirmPassword: passwordRandom,
                roleId: 0
            })
            return { ...data, newUser: 1, verify: 1 }
        }
    }


    private async getOauthGoogleToken(code: string) {
        const body = {
            code,
            client_id: envConfig.GOOGLE_CLIENT_ID,
            client_secret: envConfig.GOOGLE_CLIENT_SECRET,
            redirect_uri: envConfig.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code'
        }

        const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        return data as {
            access_token: string,
            id_token: string,
        }
    }

    private async getGoogleUserInfo(access_token: string, id_token: string) {
        const { data } = await axios.get(
            'https://www.googleapis.com/oauth2/v3/tokeninfo',
            {
                params: {
                    access_token,
                    alt: 'json'
                },
                headers: {
                    Authorization: `Bearer ${id_token}`
                }
            }
        )
        return data as {
            user_id: string
            email: string
            email_verified: string
            access_type: string
        }
    }
}
