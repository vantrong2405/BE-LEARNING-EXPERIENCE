import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../constant/auth.constant';

@Injectable()
export class VerifiedGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request[REQUEST_USER_KEY];

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.verify !== 1) {
            throw new UnauthorizedException('User not verified');
        }

        return true;
    }
}