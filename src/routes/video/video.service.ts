import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class VideoService {
  constructor(private readonly prismaService: PrismaService) { }

  async createVideo(data: { lessonId: string; courseId: string; orderLesson: number; title: string; description?: string; videoUrl: string; duration: number }) {
    try {
      return await this.prismaService.$transaction(async (prisma) => {
        // Validate course existence
        const course = await prisma.course.findUnique({
          where: { id: data.courseId },
        })
        if (!course) {
          throw new HttpException('Course not found', HttpStatus.NOT_FOUND)
        }

        // Validate lesson existence
        const lesson = await prisma.lesson.findUnique({
          where: { id: data.lessonId },
        })
        if (!lesson) {
          throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND)
        }

        // Update order of existing videos
        await prisma.video.updateMany({
          where: {
            lessonId: data.lessonId,
            orderLesson: {
              gte: data.orderLesson
            }
          },
          data: {
            orderLesson: {
              increment: 1
            }
          }
        })

        return await prisma.video.create({
          data: {
            lessonId: data.lessonId,
            courseId: data.courseId,
            orderLesson: data.orderLesson,
            title: data.title,
            description: data.description,
            videoUrl: data.videoUrl,
            duration: data.duration,
          },
          include: {
            lesson: true,
          },
        })
      })
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Failed to create video', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getVideosByLessonId(lessonId: string) {
    try {
      const lesson = await this.prismaService.lesson.findUnique({
        where: { id: lessonId },
      })
      if (!lesson) {
        throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND)
      }

      return await this.prismaService.video.findMany({
        where: { lessonId },
        include: {
          lesson: true,
        },
      })
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Failed to fetch videos', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateVideo(id: string, data: { videoUrl?: string; duration?: number }) {
    try {
      const video = await this.prismaService.video.findUnique({
        where: { id },
      })

      if (!video) {
        throw new HttpException('Video not found', HttpStatus.NOT_FOUND)
      }

      return await this.prismaService.video.update({
        where: { id },
        data,
        include: {
          lesson: true,
        },
      })
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Failed to update video', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteVideo(id: string) {
    try {
      const video = await this.prismaService.video.findUnique({
        where: { id },
      })

      if (!video) {
        throw new HttpException('Video not found', HttpStatus.NOT_FOUND)
      }

      await this.prismaService.video.delete({
        where: { id },
      })

      return { message: 'Video deleted successfully' }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Failed to delete video', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
