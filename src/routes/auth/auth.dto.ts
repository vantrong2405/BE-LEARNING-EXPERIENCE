import { Type } from 'class-transformer'
import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator'
import { Match } from 'src/shared/decorators/custom-validator.decorator'

// schema body DTO
export class LoginBodyDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  password: string
}

export class RegisterBodyDTO {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @Length(6, 20)
  password: string

  @IsNotEmpty()
  @Match('password')
  confirmPassword: string

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other'], { message: "Gender must be 'male', 'female', or 'other'" })
  gender?: string

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date

  @IsNotEmpty()
  @IsIn(['Admin', 'Instructor', 'User'], { message: "roleId must be 'Admin', 'Instructor', or 'User'" })
  role: string
}

// custom DTO
export class RefreshTokenBodyDTO {
  @IsNotEmpty({ message: 'Refresh Token is required' })
  @IsString()
  refreshToken: string
}

export class LogoutBodyDTO {
  @IsNotEmpty({ message: 'Refresh Token is required' })
  @IsString()
  refreshToken: string
}

export class RequestEmailVerificationDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string
}

export class VerifyEmailDTO {
  @IsNotEmpty()
  @IsString()
  email_verify_token: string
}

export class ForgotPasswordDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string
}

export class ResetPasswordDTO {
  @IsNotEmpty()
  @IsString()
  forgot_password_token: string
  token: string
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  new_password: string

  newPassword: string
  @Match('new_password')
  confirm_password: string
}
