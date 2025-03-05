import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { LoginBodyDTO, RegisterBodyDTO } from './auth.dto'
import { TokenService } from 'src/shared/services/token.service'
import { EmailService } from 'src/shared/services/email.service'
import { isNotFoundPrismaError, isUniqueConstrainError } from 'src/shared/helpers'
import { generateUsername } from 'src/utils/helpers'
import { Prisma, Role } from '@prisma/client'
import axios from 'axios'
import envConfig from 'src/shared/config'
import { ChangePasswordDTO, UpdateProfileDTO } from './user.dto'
import { throwError } from 'rxjs'

@Injectable()
export class AuthService {
  constructor(
    private readonly haShingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {}
  async register(body: RegisterBodyDTO) {
    try {
      const hashedPassword = await this.haShingService.hash(body.password)
      const dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null

      const user = await this.prismaService.user.create({
        data: {
          name: body.name,
          username: generateUsername(body.name),
          email: body.email,
          password: hashedPassword,
          dateOfBirth: dateOfBirth,
          role: body.role as Role,
          verify: 0,
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          dateOfBirth: true,
          role: true,
          createdAt: true,
        },
      })

      const emailVerifyToken = await this.tokenService.signAccessToken({ userId: user.id })
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { email_verify_token: emailVerifyToken },
      })

      await this.emailService.sendVerificationEmail(user.email, emailVerifyToken)

      return {
        user,
        message: 'Registration successful. Please check your email to verify your account.',
      }
    } catch (error) {
      if (isUniqueConstrainError(error)) {
        throw new ConflictException({
          status: 409,
          message: 'Email already exists',
        })
      }
      throw error
    }
  }

  async login(body: LoginBodyDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (!user) {
      throw new NotFoundException({
        status: 404,
        message: 'User not found',
      })
    }

    const isPasswordMatch = await this.haShingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      throw new UnauthorizedException({
        status: 401,
        message: 'Password is incorrect',
      })
    }
    const tokens = await this.generateTokens({ userId: user.id })
    return tokens
  }

  async generateTokens(payload: { userId: string }) {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, verify: true },
    })

    const tokenPayload = { userId: payload.userId, role: user.role, verify: user.verify }
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(tokenPayload),
      this.tokenService.signRefreshToken(tokenPayload),
    ])

    // khi giải mã thì nó sẽ trả về 1 object data người khi đăng ký lúc đầu là userId + thêm 2 field tự jwt tự tạo là exp và iat
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: new Date(decodedRefreshToken.exp * 1000),
      },
    })
    return { accessToken, refreshToken }
  }

  async refreshToken(refreshToken: string) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

      // 2. Kiểm tra refreshToken có tồn tại trong database không
      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: refreshToken,
        },
      })

      // 3. Xóa refreshToken cũ
      await this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      })

      // 4. Tạo mới accessToken và refreshToken
      return await this.generateTokens({ userId })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException({
          status: 401,
          message: 'Refresh token has been revoked',
        })
      }
      throw new UnauthorizedException()
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken)
      // 2. Xoas refreshToken trong database không
      await this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      })
      return { message: 'Logout success' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException({
          status: 401,
          message: 'Refresh token has been revoked',
        })
      }
      throw new UnauthorizedException()
    }
  }

  async oauth(code: string) {
    try {
      const { access_token } = await this.getOauthGoogleToken(code)
      const userInfo = await this.getGoogleUserInfo(access_token)

      if (!userInfo.email_verified) {
        throw new UnauthorizedException('Email not verified with Google')
      }

      if (!userInfo.email) {
        throw new BadRequestException('Email not provided by Google')
      }

      const user = await this.prismaService.user.findUnique({
        where: {
          email: userInfo.email as string,
        },
      })

      if (user) {
        const [access_token, refresh_token] = await this.tokenService.signAccessAndRefreshToken({
          userId: user.id,
          verify: 1,
        })
        const { iat, exp } = await this.tokenService.decodeRefreshToken(refresh_token)
        await this.prismaService.refreshToken.update({
          where: {
            userId: user.id,
            expiresAt: new Date(exp * 1000),
            token: refresh_token,
            createdAt: new Date(iat * 1000),
          },
          data: {
            token: refresh_token,
          },
        })

        return {
          access_token,
          refresh_token,
          newUser: 0, // chưa có user thì newUser = 0
          verify: user.verify,
        }
      } else {
        const passwordRandom = Math.random().toString(36).substring(2, 15)
        const data = await this.register({
          name: userInfo.email,
          email: userInfo.email,
          password: passwordRandom,
          dateOfBirth: new Date(),
          confirmPassword: passwordRandom,
          role: 'USER',
        })
        return { ...data, newUser: 1, verify: 1 }
      }
    } catch (error) {
      throw error
    }
  } // Đóng ngoặc đầy đủ

  private async getOauthGoogleToken(code: string) {
    try {
      const body = {
        code,
        client_id: envConfig.GOOGLE_CLIENT_ID,
        client_secret: envConfig.GOOGLE_CLIENT_SECRET,
        redirect_uri: envConfig.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }

      const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      return data as {
        access_token: string
        id_token: string
      }
    } catch (error) {
      throwError(() => new UnauthorizedException('Failed to get Google OAuth token'))
    }
  }

  private async getGoogleUserInfo(access_token: string) {
    try {
      const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      return data as {
        sub: string
        email: string
        email_verified: boolean
        name: string
        picture: string
      }
    } catch (error) {
      throw new UnauthorizedException('Failed to get Google user info')
    }
  }

  async verifyEmail(userId: string, providedToken: string) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          id: userId,
        },
      })

      if (!user) {
        throw new BadRequestException('Invalid verification token')
      }

      if (user.email_verify_token !== providedToken) {
        throw new BadRequestException('Invalid verification token')
      }

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          verify: 1,
          email_verify_token: null,
        },
      })

      return { message: 'Email verified successfully' }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Failed to verify email')
    }
  }

  async resendVerificationEmail(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new NotFoundException({
          status: 404,
          message: 'User not found',
        })
      }

      if (user.verify === 1) {
        throw new ConflictException({
          status: 409,
          message: 'Email is already verified',
        })
      }

      const emailVerifyToken = await this.tokenService.signAccessToken({ userId: user.id })

      await this.prismaService.user.update({
        where: { id: user.id },
        data: { email_verify_token: emailVerifyToken },
      })

      await this.emailService.sendVerificationEmail(user.email, emailVerifyToken)

      return { message: 'Verification email has been resent' }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Failed to resend verification email')
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })

      if (!user) {
        throw new BadRequestException('Email not found')
      }

      const forgot_password_token = await this.tokenService.signAccessToken({ userId: user.id })

      await this.prismaService.user.update({
        where: { id: user.id },
        data: { forgot_password_token },
      })

      await this.emailService.sendPasswordResetEmail(user.email, forgot_password_token)

      return {
        message: 'Please check your email for password reset instructions',
        forgot_password_token,
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Failed to process forgot password request')
    }
  }

  async verifyForgotPassword(forgot_password_token: string) {
    try {
      const decodedToken = await this.tokenService.verifyAccessToken(forgot_password_token)
      const { userId } = decodedToken

      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      })

      if (!user || user.forgot_password_token !== forgot_password_token) {
        throw new BadRequestException('Invalid or expired reset password token')
      }

      return {
        message: 'Verify forgot is success',
        userId: user.id,
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Invalid reset password token')
    }
  }

  async resetPassword(userId: string, newPassword: string, confirmPassword: string) {
    try {
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Passwords do not match')
      }

      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new NotFoundException({
          status: 404,
          message: 'User not found',
        })
      }

      const hashedPassword = await this.haShingService.hash(newPassword)

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          forgot_password_token: null,
        },
      })

      return { message: 'Password has been reset successfully' }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Failed to reset password')
    }
  }
  async deleteDatabase() {
    try {
      await this.prismaService.$transaction([
        // First, delete child tables with foreign key dependencies
        this.prismaService.review.deleteMany(),
        this.prismaService.payment.deleteMany(),
        this.prismaService.enrollment.deleteMany(),
        this.prismaService.lesson.deleteMany(),
        this.prismaService.refreshToken.deleteMany(),
        // Then delete parent tables
        this.prismaService.course.deleteMany(),
        this.prismaService.category.deleteMany(),
        this.prismaService.user.deleteMany(),
      ])
      return { message: 'Database cleared successfully' }
    } catch (error) {
      console.error('Database cleanup error:', error)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(`Database cleanup failed: ${error.message}`)
      }
      throw new BadRequestException('Failed to clear database. Please try again.')
    }
  }

  async getProfile(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          gender: true,
          dateOfBirth: true,
          bio: true,
          avatarUrl: true,
          courses: true,
          reviews: true,
          role: true,
          verify: true,
        },
      })

      if (!user) {
        throw new NotFoundException({
          status: 404,
          message: 'User not found',
        })
      }

      return user
    } catch (error) {
      throw error
    }
  }

  async getProfileUserDiff(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          gender: true,
          dateOfBirth: true,
          bio: true,
          avatarUrl: true,
          courses: true,
          reviews: true,
          role: true,
          verify: true,
        },
      })

      if (!user) {
        throw new NotFoundException({
          status: 404,
          message: 'User not found',
        })
      }

      return user
    } catch (error) {
      throw error
    }
  }

  async changePassword(userId: string, body: ChangePasswordDTO) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new NotFoundException({
          status: 404,
          message: 'User not found',
        })
      }

      const isPasswordMatch = await this.haShingService.compare(body.current_password, user.password)
      if (!isPasswordMatch) {
        throw new BadRequestException('Current password is incorrect')
      }

      const hashedPassword = await this.haShingService.hash(body.new_password)
      await this.prismaService.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })

      return { message: 'Password changed successfully' }
    } catch (error) {
      throw error
    }
  }

  async updateProfile(userId: string, body: UpdateProfileDTO) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new NotFoundException({
          status: 404,
          message: 'User not found',
        })
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: {
          name: body.name,
          gender: body.gender,
          dateOfBirth: body.dateOfBirth,
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          gender: true,
          dateOfBirth: true,
          bio: true,
          avatarUrl: true,
          courses: true,
          reviews: true,
          role: true,
          verify: true,
        },
      })

      return updatedUser
    } catch (error) {
      throw error
    }
  }

  async getAllUsers() {
    try {
      const result = await this.prismaService.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          gender: true,
          dateOfBirth: true,
          bio: true,
          avatarUrl: true,
          courses: true,
          reviews: true,
          role: true,
          verify: true,
        },
      })
      return result
    } catch (error) {
      throw error
    }
  }

  async deleteUser(userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      })
      console.log('🚀 ~ AuthService ~ deleteUser ~ user:', user)

      if (!user) {
        throw new NotFoundException('User not found')
      }

      await this.prismaService.user.delete({
        where: { id: user.id },
      })

      return { message: 'User deleted successfully' }
    } catch (error) {
      throw error
    }
  }
}
