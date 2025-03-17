import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString, IsNumber, IsUrl, Min, IsOptional, IsBoolean } from 'class-validator'

export class CreateCourseDTO {
  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsString()
  description: string

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number

  @IsNotEmpty()
  @IsUrl()
  thumbnailUrl: string

  @IsNotEmpty()
  @IsUrl()
  bannerUrl: string

  @IsNotEmpty()
  @IsString()
  categoryId: string

  @IsNotEmpty()
  @IsString()
  levelId: string

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean

  @IsOptional()
  @IsBoolean()
  moneyBackGuarantee?: boolean

  @IsOptional()
  @IsNumber()
  @Min(0)
  videoHours?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  articlesCount?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  downloadableResources?: number

  @IsOptional()
  @IsBoolean()
  lifetimeAccess?: boolean

  @IsOptional()
  @IsBoolean()
  certificate?: boolean

  @IsOptional()
  @IsString()
  courseOverview?: string

  @IsOptional()
  @IsString()
  learningObjectives?: string

  @IsOptional()
  @IsString()
  courseFeatures?: string

  @IsOptional()
  @IsString()
  requirements?: string
}

export class UpdateCourseDTO {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string

  @IsOptional()
  @IsUrl()
  bannerUrl?: string

  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsString()
  levelId?: string

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean

  @IsOptional()
  @IsBoolean()
  moneyBackGuarantee?: boolean

  @IsOptional()
  @Transform(({ value }) => parseFloat(value)) // Chuyển đổi sang số
  @IsNumber({}, { message: 'Price must be a number' }) // Cho phép số float
  @Min(0)
  price?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({}, { message: 'Video hours must be a number' })
  @Min(0)
  videoHours?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'Articles count must be a number' })
  @Min(0)
  articlesCount?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'Downloadable resources must be a number' })
  @Min(0)
  downloadableResources?: number;

  @IsOptional()
  @IsBoolean()
  lifetimeAccess?: boolean

  @IsOptional()
  @IsBoolean()
  certificate?: boolean

  @IsOptional()
  @IsString()
  courseOverview?: string

  @IsOptional()
  @IsString()
  learningObjectives?: string

  @IsOptional()
  @IsString()
  courseFeatures?: string

  @IsOptional()
  @IsString()
  requirements?: string
}
