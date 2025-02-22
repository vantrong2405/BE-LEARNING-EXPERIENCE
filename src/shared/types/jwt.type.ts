export interface TokenPayload {
    userId: number
    roleId?: number
    iat: number
    exp: number
}