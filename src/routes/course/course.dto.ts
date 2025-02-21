import { IsNotEmpty, IsString, IsNumber, IsUrl, Min, IsOptional } from 'class-validator';

export class CreateCourseDTO {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @IsNotEmpty()
    @IsUrl()
    thumbnailUrl: string;

    @IsNotEmpty()
    @IsUrl()
    bannerUrl: string;

    @IsNotEmpty()
    @IsNumber()
    instructorId: number;

    @IsNotEmpty()
    @IsNumber()
    categoryId: number;
}

export class UpdateCourseDTO {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsUrl()
    thumbnailUrl?: string;

    @IsOptional()
    @IsUrl()
    bannerUrl?: string;

    @IsOptional()
    @IsNumber()
    instructorId?: number;

    @IsOptional()
    @IsNumber()
    categoryId?: number;
}