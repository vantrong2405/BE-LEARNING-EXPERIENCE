import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from 'src/shared/decorators/auth.decorator';
import { AccessTokenGuard } from './access-token.guard';
import { APIKeyGuard } from './api-key.guard';
import { AuthType, ConditionGuard } from '../constant/auth.constant';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    private readonly authTypeGuardMap: Record<string, CanActivate> = {
        [AuthType.Bearer]: this.accessTokenGuard,
        [AuthType.APIKey]: this.apiKeyGuard,
        [AuthType.None]: { canActivate: () => true }
    };

    constructor(
        private readonly reflector: Reflector,
        private readonly accessTokenGuard: AccessTokenGuard,
        private readonly apiKeyGuard: APIKeyGuard
    ) {
        this.authTypeGuardMap = {
            [AuthType.Bearer]: this.accessTokenGuard,
            [AuthType.APIKey]: this.apiKeyGuard,
            [AuthType.None]: { canActivate: () => true }
        };
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? { authTypes: [AuthType.None], options: { condition: ConditionGuard.And } };

        const guards = ('authTypes' in authTypeValue ? authTypeValue.authTypes : [AuthType.None]).map((authType) => {
            const guard = this.authTypeGuardMap[authType];
            if (!guard) {
                throw new Error(`Unknown auth type: ${authType}`);
            }
            return guard;
        });

        let error = new UnauthorizedException('Authentication failed');

        if (authTypeValue.options.condition === ConditionGuard.Or) {
            for (const instance of guards) {
                try {
                    const canActivate = await Promise.resolve(instance.canActivate(context)).catch(err => {
                        error = err;
                        return false;
                    });
                    if (canActivate) {
                        return true;
                    }
                } catch (err) {
                    error = err;
                }
            }
            throw error;
        } else {
            for (const instance of guards) {
                try {
                    const canActivate = await Promise.resolve(instance.canActivate(context)).catch(err => {
                        error = err;
                        return false;
                    });
                    if (!canActivate) {
                        return false;
                    }
                } catch (err) {
                    error = err;
                    return false;
                }
            }
        }

        return true;
    }
}
