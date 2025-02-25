import { IsString, IsNumber, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator'

export class CreateLessonDTO {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string

  @IsOptional()
  @IsNumber()
  courseId: number

  @IsOptional()
  @IsNumber()
  order?: number

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean
}

export class UpdateLessonDTO {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string

  @IsOptional()
  @IsNumber()
  courseId: number

  @IsOptional()
  @IsNumber()
  order?: number

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean
}
