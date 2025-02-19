import { Type } from "class-transformer";
import {
    IsDate,
    IsEmail,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
} from "class-validator";
import { Match } from "src/shared/decorators/custom-validator.decorator";

// schema body DTO
export class LoginBodyDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, 20)
    password: string;
}

export class RegisterBodyDTO {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @Length(6, 20)
    password: string;

    @IsNotEmpty()
    @Match("password")
    confirmPassword: string;

    @IsOptional()
    @IsString()
    @IsIn(["male", "female", "other"], { message: "Gender must be 'male', 'female', or 'other'" })
    gender?: string; // male, female, other

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    dateOfBirth: Date;

    @IsNotEmpty()
    @IsNumber({}, { message: "Role ID must be a number" })
    @IsIn([0, 1, 2], { message: "roleId must be 0 (student), 1 (instructor), or 2 (admin)" })
    roleId: number; // 0 = Student, 1 = Instructor, 2 = Admin
}

// custom DTO
export class RefreshTokenBodyDTO {
    @IsNotEmpty({ message: "Refresh Token is required" })
    @IsString()
    refreshToken: string;
}

export class LogoutBodyDTO {
    @IsNotEmpty({ message: "Refresh Token is required" })
    @IsString()
    refreshToken: string;
}