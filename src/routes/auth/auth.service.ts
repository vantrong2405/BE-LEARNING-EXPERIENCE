import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { LoginBodyDTO, RegisterBodyDTO } from './auth.dto';
import { TokenService } from 'src/shared/services/token.service';
import { isNotFoundPrismaError, isUniqueConstrainError } from 'src/shared/helpers';

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
            const user = await this.prismaService.user.create({
                data: {
                    email: body.email,
                    password: hashedPassword,
                    name: body.name
                }
            })
            return user
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

}
