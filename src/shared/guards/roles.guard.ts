import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new UnauthorizedException('User not authenticated')
    }

    // Get user from database to ensure we have the latest role
    const dbUser = await this.prismaService.user.findUnique({
      where: { id: user.userId },
    })

    if (!dbUser) {
      throw new UnauthorizedException('User not found')
    }

    // Check if user's role matches required roles
    return requiredRoles.some((requiredRole) => dbUser.role === requiredRole)
  }
}
