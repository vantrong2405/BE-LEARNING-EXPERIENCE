import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDTO, LoginBodyDTO, LogoutBodyDTO, RefreshTokenBodyDTO, RegisterBodyDTO, ResetPasswordDTO, VerifyEmailDTO } from './auth.dto';
import { Response } from 'express'
import { TokenService } from 'src/shared/services/token.service';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { ChangePasswordDTO, UpdateProfileDTO } from './user.dto';
import { REQUEST_USER_KEY } from 'src/shared/constant/auth.constant';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly tokenService: TokenService) { }
    @Post('register')
    async register(@Body() body: RegisterBodyDTO) {
        return await this.authService.register(body)
    }

    @Post('login')
    async login(@Body() body: LoginBodyDTO) {
        return await this.authService.login(body)
    }

    @Post('refresh-token')
    async refreshToken(@Body() body: RefreshTokenBodyDTO) {
        return await this.authService.refreshToken(body.refreshToken)
    }

    @Post('logout')
    async logout(@Body() body: LogoutBodyDTO) {
        return await this.authService.logout(body.refreshToken)
    }

    @Get('/oauth/google')
    async loginWithGoogle(@Req() req, @Res() res: Response) {
        const { code } = req.query
        const result = await this.authService.oauth(code as string)
        const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`
        return res.redirect(urlRedirect)
    }

    @Post('/verify-email')
    async verifyEmail(@Body() body: VerifyEmailDTO) {
        if (!body.email_verify_token) {
            throw new BadRequestException('Verification token is required');
        }

        const decodedToken = await this.tokenService.verifyAccessToken(body.email_verify_token);
        const { userId } = decodedToken;

        return await this.authService.verifyEmail(userId, body.email_verify_token);
    }

    @Post('/resend-verify-email')
    async resendVerificationEmail(@Body('email_verify_token') email_verify_token: string) {
        if (!email_verify_token) {
            throw new BadRequestException('Verification token is required');
        }
        const decodedToken = await this.tokenService.verifyAccessToken(email_verify_token);
        const { userId } = decodedToken;

        return await this.authService.resendVerificationEmail(userId);
    }

    @Post('/forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDTO) {
        return await this.authService.forgotPassword(body.email);
    }

    @Post('/verify-forgot-password')
    async verifyForgotPassword(@Body('forgot_password_token') forgot_password_token: string) {
        if (!forgot_password_token) {
            throw new BadRequestException('Reset password token is required');
        }
        return await this.authService.verifyForgotPassword(forgot_password_token);
    }

    @Post('/reset-password')
    async resetPassword(@Body() body: ResetPasswordDTO) {
        if (!body.forgot_password_token) {
            throw new BadRequestException('Reset password token is required');
        }

        const decodedToken = await this.tokenService.verifyAccessToken(body.forgot_password_token);
        const { userId } = decodedToken;

        return await this.authService.resetPassword(userId, body.new_password, body.confirm_password);
    }

    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles('admin')
    @Post('/delete-db')
    async deleteDatabase() {
        return await this.authService.deleteDatabase();
    }

    @Get('/get-me')
    @UseGuards(AccessTokenGuard)
    async getMe(@Req() req) {
        const userId = req[REQUEST_USER_KEY].userId;
        return await this.authService.getProfile(userId);
    }

    @Get('/profile/:id')
    @UseGuards(AccessTokenGuard)
    async getProfile(@Param('id') userId: string) {
        return await this.authService.getProfileUserDiff(userId);
    }

    @Post('/change-password')
    @UseGuards(AccessTokenGuard)
    async changePassword(@Req() req, @Body() body: ChangePasswordDTO) {
        const userId = req[REQUEST_USER_KEY].userId;
        return await this.authService.changePassword(userId, body);
    }

    @Post('/update-me')
    @UseGuards(AccessTokenGuard)
    async updateMe(@Req() req, @Body() body: UpdateProfileDTO) {
        const userId = req[REQUEST_USER_KEY].userId;
        return await this.authService.updateProfile(userId, body);
    }

    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles('admin')
    @Get('/users')
    async getAllUsers() {
        return await this.authService.getAllUsers();
    }

    @UseGuards(AccessTokenGuard, RolesGuard)
    @Roles('admin')
    @Delete('/users/:id')
    async deleteUser(@Param('id') userId: string) {
        return await this.authService.deleteUser(userId);
    }
}
