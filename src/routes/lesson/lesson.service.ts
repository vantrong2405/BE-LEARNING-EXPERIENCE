import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateLessonDTO } from './lesson.dto';

@Injectable()
export class LessonService {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async getLessonsByCourseId(courseId: number, { page, limit }: { page: number; limit: number }) {
        try {
            const skip = (page - 1) * limit;

            const [total, lessons] = await Promise.all([
                this.prismaService.lesson.count({
                    where: { courseId }
                }),
                this.prismaService.lesson.findMany({
                    where: { courseId },
                    skip,
                    take: limit,
                    include: {
                        course: true,
                        videos: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                })
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                data: lessons,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages
                }
            };
        } catch (error) {
            throw new Error('Failed to fetch lessons');
        }
    }

    async createLesson(data: CreateLessonDTO) {
        try {
            return await this.prismaService.lesson.create({
                data: {
                    title: data.title,
                    content: data.description,
                    courseId: data.courseId,
                    order: data.order
                },
                include: {
                    course: true,
                    videos: true
                }
            });
        } catch (error) {
            throw new Error('Failed to create lesson');
        }
    }

    async updateLesson(id: number, data: {
        title?: string;
        description?: string;
        order?: number;
        isPublished?: boolean;
    }) {
        try {
            const lesson = await this.prismaService.lesson.findUnique({
                where: { id }
            });

            if (!lesson) {
                throw new Error('Lesson not found');
            }

            return await this.prismaService.lesson.update({
                where: { id },
                data,
                include: {
                    course: true,
                    videos: true
                }
            });
        } catch (error) {
            throw new Error('Failed to update lesson');
        }
    }

    async deleteLesson(id: number) {
        try {
            const lesson = await this.prismaService.lesson.findUnique({
                where: { id }
            });

            if (!lesson) {
                throw new Error('Lesson not found');
            }

            await this.prismaService.lesson.delete({
                where: { id }
            });

            return { message: 'Lesson deleted successfully' };
        } catch (error) {
            throw new Error('Failed to delete lesson');
        }
    }
}
