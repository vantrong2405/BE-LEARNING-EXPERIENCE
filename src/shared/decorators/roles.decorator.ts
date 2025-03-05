import { SetMetadata } from '@nestjs/common'

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
  Instructor = 'Instructor',
}

export const ROLES_KEY = 'roles'
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
