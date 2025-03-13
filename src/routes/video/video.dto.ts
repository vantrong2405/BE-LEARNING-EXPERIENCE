import { IsString, IsUUID, IsInt, Min, IsOptional } from 'class-validator'

export class CreateVideoDto {
  @IsUUID()
  lessonId: string

  @IsUUID()
  courseId: string

  @IsInt()
  @Min(1)
  orderLesson: number

  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  videoUrl: string

  @IsInt()
  @Min(1)
  duration: number
}
