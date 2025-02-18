import { Exclude, Type } from "class-transformer"
import { IsString, Length } from "class-validator"
import { Match } from "src/shared/decorators/custom-validator.decorator"
import { SuccessResDTO } from "src/shared/shared.dto"

export class LoginBodyDTO {
    @IsString()
    email: string

    @IsString()
    @Length(6, 20)
    password: string
}

export class RegisterBodyDTO extends LoginBodyDTO {
    @IsString()
    name: string

    @IsString()
    @Match('password', { message: 'Passwords do not match' })
    confirmPassword: string
}

class RegisterData {
    id: number
    email: string
    name: string
    @Exclude() password: string
    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<RegisterData>) {
        Object.assign(this, partial);
    }
}
class LoginData {
    email: string
    password: string
    constructor(partial: Partial<RegisterData>) {
        Object.assign(this, partial);
    }
}

export class RegisterEntity extends SuccessResDTO {
    @Type(() => RegisterData)
    data: RegisterData
}

export class LoginEntity extends SuccessResDTO {
    @Type(() => LoginData)
    data: LoginData
}

export class RefreshTokenBodyDTO {
    @IsString()
    refreshToken: string
}

export class RefreshtokenEntity extends LoginEntity {

}


export class LogoutBodyDTO extends RefreshTokenBodyDTO { }

export class LogoutResDTO {
    message: string
    constructor(partial: Partial<LogoutResDTO>) {
        Object.assign(this, partial);
    }
}