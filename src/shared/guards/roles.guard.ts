import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Get user's role
    const role = await this.prismaService.role.findUnique({
      where: { id: user.roleId },
      include: {
        permissions: true
      }
    });

    if (!role) {
      return false;
    }

    // Check if user's role matches required roles
    return requiredRoles.some((requiredRole) => role.name === requiredRole);
  }
}