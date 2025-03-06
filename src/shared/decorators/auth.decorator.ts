import { SetMetadata } from '@nestjs/common'
import { AuthTypeType, ConditionGuard, ConditionGuardType } from '../constant/auth.constant'

export const AUTH_TYPE_KEY = 'authType'
export interface AuthTypeDecoratorPayload {
  authType: AuthTypeType[]
  options?: {
    condition: ConditionGuardType
  }
}

export const Auth = (authTypes: AuthTypeType[], options?: { condition: ConditionGuardType }) => {
  return SetMetadata(AUTH_TYPE_KEY, { authTypes, options: options ?? { condition: ConditionGuard.And } })
}
