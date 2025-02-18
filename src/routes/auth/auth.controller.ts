import { Body, Controller, Post, SerializeOptions } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginBodyDTO, LoginEntity, LogoutBodyDTO, LogoutResDTO, RefreshTokenBodyDTO, RegisterBodyDTO, RegisterEntity } from './auth.dto';

@Controller('auth')


export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @SerializeOptions({ type: RegisterEntity })
    @Post('register')
    async register(@Body() body: RegisterBodyDTO) {
        return await this.authService.register(body)
    }

    @SerializeOptions({ type: LoginEntity })
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
        return new LogoutResDTO(await this.authService.logout(body.refreshToken))
    }
}
