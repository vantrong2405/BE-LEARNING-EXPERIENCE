import { Type } from 'class-transformer'
import {
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MinLength,
} from 'class-validator'
import { Match } from 'src/shared/decorators/custom-validator.decorator'

export class ChangePasswordDTO {
  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  current_password: string

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  new_password: string

  @IsNotEmpty()
  @Match('new_password')
  confirm_password: string
}

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other'], { message: "Gender must be 'male', 'female', or 'other'" })
  gender?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date

  @IsOptional()
  @IsString()
  bio?:string

  @IsOptional()
  @IsUrl()
  @IsString()
  avatarUrl?: string
}
