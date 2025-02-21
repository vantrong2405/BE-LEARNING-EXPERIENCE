import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';
import { APIKeyGuard } from './guards/api-key.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication.guard';
import { EmailService } from './services/email.service';

@Global()
@Module({
    imports: [JwtModule],
    providers: [
        PrismaService,
        HashingService,
        TokenService,
        EmailService,
        AccessTokenGuard,
        APIKeyGuard,
        {
            provide: APP_GUARD,
            useClass: AuthenticationGuard
        }
    ],
    exports: [PrismaService, HashingService, TokenService, AccessTokenGuard, APIKeyGuard, EmailService]
})
export class SharedModule { }

