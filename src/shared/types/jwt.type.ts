export interface TokenPayload {
  userId: string
  roleId?: number
  verify?: number
  iat: number
  exp: number
}
