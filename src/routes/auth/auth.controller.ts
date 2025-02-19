import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginBodyDTO, LogoutBodyDTO, RefreshTokenBodyDTO, RegisterBodyDTO } from './auth.dto';
import { Response } from 'express'
@Controller('auth')

export class AuthController {
    constructor(private readonly authService: AuthService) { }
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
}
