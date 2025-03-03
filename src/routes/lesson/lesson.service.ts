import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateLessonDTO, UpdateLessonDTO } from './lesson.dto';

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
                        course: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                price: true,
                                thumbnailUrl: true,
                                bannerUrl: true,
                                isPublished: true,
                                createdAt: true,
                                updatedAt: true,
                                instructor: {
                                    select: {
                                        id: true,
                                        name: true,
                                        username: true,
                                        avatarUrl: true,
                                        bio: true,
                                        gender: true,
                                        createdAt: true,
                                        updatedAt: true
                                    }
                                },
                                category: true
                            }
                        },
                        videos: true
                    },
                    orderBy: {
                        createdAt: 'asc'
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
            return await this.prismaService.$transaction(async (prisma) => {
                // Check if there's any lesson with the requested order
                const existingLesson = await prisma.lesson.findFirst({
                    where: {
                        courseId: data.courseId,
                        order: data.order
                    }
                });

                // Only shift lessons if there's a conflict
                if (existingLesson) {
                    await prisma.lesson.updateMany({
                        where: {
                            courseId: data.courseId,
                            order: { gte: data.order }
                        },
                        data: {
                            order: { increment: 1 }
                        }
                    });
                }

                // Create the new lesson
                return await prisma.lesson.create({
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
            });
        } catch (error) {
            throw new Error('Failed to create lesson');
        }
    }

    async updateLesson(id: number, data: UpdateLessonDTO) {
        try {
            return await this.prismaService.lesson.update({
                where: { id },
                data: {
                    title: data.title,
                    order: data.order,
                },
            });
        } catch (error) {
            console.error("Error in updateLesson service:", error);
            throw new Error('Failed to update lesson');
        }
    }

    async deleteLesson(id: number) {
        try {
            return await this.prismaService.$transaction(async (prisma) => {
                // Find the lesson to be deleted
                const lesson = await prisma.lesson.findUnique({
                    where: { id },
                    select: { courseId: true, order: true }
                });

                if (!lesson) {
                    throw new Error('Lesson not found');
                }

                // Delete the lesson
                await prisma.lesson.delete({
                    where: { id }
                });

                // Shift down the order of all lessons after the deleted one
                await prisma.lesson.updateMany({
                    where: {
                        courseId: lesson.courseId,
                        order: { gt: lesson.order }
                    },
                    data: {
                        order: { decrement: 1 }
                    }
                });

                return { message: 'Lesson deleted successfully' };
            });
        } catch (error) {
            throw new Error('Failed to delete lesson');
        }
    }
}

