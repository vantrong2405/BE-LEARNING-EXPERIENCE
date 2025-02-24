import { IsNotEmpty, IsString, IsNumber, IsUrl, Min, IsOptional, IsBoolean } from 'class-validator';

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

    @IsNotEmpty()
    @IsNumber()
    levelId: number;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    @IsOptional()
    @IsBoolean()
    moneyBackGuarantee?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    videoHours?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    articlesCount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    downloadableResources?: number;

    @IsOptional()
    @IsBoolean()
    lifetimeAccess?: boolean;

    @IsOptional()
    @IsBoolean()
    certificate?: boolean;

    @IsOptional()
    @IsString()
    courseOverview?: string;

    @IsOptional()
    @IsString()
    learningObjectives?: string;

    @IsOptional()
    @IsString()
    courseFeatures?: string;

    @IsOptional()
    @IsString()
    requirements?: string;
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
    categoryId?: number;

    @IsOptional()
    @IsNumber()
    levelId?: number;

    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    @IsOptional()
    @IsBoolean()
    moneyBackGuarantee?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    videoHours?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    articlesCount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    downloadableResources?: number;

    @IsOptional()
    @IsBoolean()
    lifetimeAccess?: boolean;

    @IsOptional()
    @IsBoolean()
    certificate?: boolean;

    @IsOptional()
    @IsString()
    courseOverview?: string;

    @IsOptional()
    @IsString()
    learningObjectives?: string;

    @IsOptional()
    @IsString()
    courseFeatures?: string;

    @IsOptional()
    @IsString()
    requirements?: string;
}