import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';

@Injectable()
export class CoursesService {
    constructor(
        private readonly tokenService: TokenService,
        private readonly prismaService: PrismaService
    ) { }

    async getCourse({ page, limit }: { page: number; limit: number }) {
        try {
            const skip = (page - 1) * limit;

            const [total, courses] = await Promise.all([
                this.prismaService.course.count(),
                this.prismaService.course.findMany({
                    skip,
                    take: limit,
                    include: {
                        instructor: true,
                        enrollments: true,
                        category: true,
                        lessons: true,
                        reviews: true,
                        payments: true,
                        uploads: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                })
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                data: courses,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages
                }
            };
        } catch (error) {
            throw new Error('Failed to fetch courses');
        }
    }

    async getCourseById(id: number) {
        try {
            const course = await this.prismaService.course.findUnique({
                where: { id },
                include: {
                    instructor: true,
                    enrollments: true,
                    category: true,
                    lessons: {
                        include: {
                            videos: true
                        }
                    },
                    reviews: true,
                    payments: true,
                    uploads: true
                }
            });

            if (!course) {
                throw new Error('Course not found');
            }

            return course;
        } catch (error) {
            throw new Error('Failed to fetch course');
        }
    }

    async createCourse(data: {
        title: string;
        description?: string;
        price: number;
        instructorId: number;
        thumbnailUrl?: string;
        bannerUrl: string;
        categoryId?: number;
        isPublished?: boolean;
    }) {
        try {
            return await this.prismaService.course.create({
                data: {
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    instructorId: data.instructorId,
                    thumbnailUrl: data.thumbnailUrl,
                    bannerUrl: data.bannerUrl,
                    categoryId: data.categoryId,
                    isPublished: data.isPublished ?? false
                },
                include: {
                    instructor: true,
                    category: true
                }
            });
        } catch (error) {
            throw new Error('Failed to create course');
        }
    }

    async updateCourse(id: number, data: {
        title?: string;
        description?: string;
        price?: number;
        thumbnailUrl?: string;
        bannerUrl?: string;
        categoryId?: number;
        isPublished?: boolean;
    }) {
        try {
            const course = await this.prismaService.course.findUnique({
                where: { id }
            });

            if (!course) {
                throw new Error('Course not found');
            }

            return await this.prismaService.course.update({
                where: { id },
                data,
                include: {
                    instructor: true
                }
            });
        } catch (error) {
            throw new Error('Failed to update course');
        }
    }

    async deleteCourse(id: number) {
        try {
            const course = await this.prismaService.course.findUnique({
                where: { id }
            });

            if (!course) {
                throw new Error('Course not found');
            }

            await this.prismaService.course.delete({
                where: { id }
            });

            return { message: 'Course deleted successfully' };
        } catch (error) {
            throw new Error('Failed to delete course');
        }
    }
}
