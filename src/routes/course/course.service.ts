import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateCourseDTO, UpdateCourseDTO } from './course.dto';

@Injectable()
export class CoursesService {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async getCourse({ page, limit, query, categoryId, minPrice, maxPrice, minRating, maxRating, levelId }: { page: number; limit: number; query?: string; categoryId?: string; minPrice?: number; maxPrice?: number; minRating?: number; maxRating?: number; levelId?: string; }) {
        try {
            const skip = (page - 1) * limit;
            const where: any = {};

            // Add search conditions if query is provided
            if (query) {
                where.OR = [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { instructor: { name: { contains: query, mode: 'insensitive' } } }
                ];
            }

            // Add filter conditions
            if (categoryId) where.categoryId = Number(categoryId);
            if (levelId) where.levelId = Number(levelId);
            if (minPrice !== undefined && maxPrice !== undefined) {
                where.price = {
                    gte: minPrice,
                    lte: maxPrice
                };
            }
            if (minRating !== undefined && maxRating !== undefined) {
                where.rating = {
                    gte: minRating,
                    lte: maxRating
                };
            }

            const [total, courses] = await Promise.all([
                this.prismaService.course.count({ where }),
                this.prismaService.course.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                email: true,
                                role: true,
                                verify: true,
                                status_account: true,
                                dateOfBirth: true,
                                avatarUrl: true,
                                bio: true,
                                gender: true,
                                createdAt: true,
                                updatedAt: true
                            }
                        },
                        enrollments: true,
                        category: true,
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
            throw new BadRequestException({
                status: 400,
                message: 'Failed to fetch courses',
                error: 'Bad Request'
            });
        }
    }

    async searchCourses(query: string, { page, limit }: { page: number; limit: number }) {
        try {
            const skip = (page - 1) * limit;

            const [total, courses] = await Promise.all([
                this.prismaService.course.count({
                    where: {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } },
                            { instructor: { name: { contains: query, mode: 'insensitive' } } }
                        ]
                    }
                }),
                this.prismaService.course.findMany({
                    where: {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { description: { contains: query, mode: 'insensitive' } },
                            { instructor: { name: { contains: query, mode: 'insensitive' } } }
                        ]
                    },
                    skip,
                    take: limit,
                    include: {
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                email: true,
                                role: true,
                                verify: true,
                                status_account: true,
                                dateOfBirth: true,
                                avatarUrl: true,
                                bio: true,
                                gender: true,
                                createdAt: true,
                                updatedAt: true
                            }
                        },
                        enrollments: true,
                        category: true,
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
            throw new Error('Failed to search courses');
        }
    }

    async filterCourses(
        filters: {
            categoryId?: number;
            priceRange?: [number, number];
            ratingRange?: [number, number];
            levelId?: number;
        },
        { page, limit }: { page: number; limit: number }
    ) {
        try {
            const skip = (page - 1) * limit;
            const where: any = {};

            if (filters.categoryId) {
                where.categoryId = filters.categoryId;
            }

            if (filters.levelId) {
                where.levelId = filters.levelId;
            }

            if (filters.priceRange) {
                where.price = {
                    gte: filters.priceRange[0],
                    lte: filters.priceRange[1]
                };
            }

            if (filters.ratingRange) {
                where.rating = {
                    gte: filters.ratingRange[0],
                    lte: filters.ratingRange[1]
                };
            }

            if (filters.ratingRange) {
                where.reviews = {
                    some: {
                        rating: {
                            gte: filters.ratingRange[0],
                            lte: filters.ratingRange[1]
                        }
                    }
                };
            }

            const [total, courses] = await Promise.all([
                this.prismaService.course.count({ where }),
                this.prismaService.course.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                email: true,
                                role: true,
                                verify: true,
                                status_account: true,
                                dateOfBirth: true,
                                avatarUrl: true,
                                bio: true,
                                gender: true,
                                createdAt: true,
                                updatedAt: true
                            }
                        },
                        enrollments: true,
                        category: true,
                        reviews: true
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
            throw new Error('Failed to filter courses');
        }
    }

    async getCourseById(id: string) {
        try {
            const course = await this.prismaService.course.findUnique({
                where: { id },
                include: {
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            role: true,
                            verify: true,
                            status_account: true,
                            dateOfBirth: true,
                            avatarUrl: true,
                            bio: true,
                            gender: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    },
                    enrollments: true,
                    category: true,
                    lessons: {
                        include: {
                            videos: true
                        }
                    },
                    reviews: true,
                    payments: true,
                }
            });

            if (!course) {
                throw new NotFoundException({
                    status: 404,
                    message: 'Course not found',
                    error: 'Not Found'
                });
            }

            return course;
        } catch (error) {
            throw new Error('Failed to fetch course');
        }
    }

    async createCourse(data: CreateCourseDTO) {
        try {
            return await this.prismaService.course.create({
                data: {
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    instructorId: data.instructorId,
                    categoryId: data.categoryId,
                    levelId: data.levelId,
                    thumbnailUrl: data.thumbnailUrl,
                    bannerUrl: data.bannerUrl,
                    isPublished: data.isPublished ?? false, // Mặc định là false nếu không có
                },
                include: {
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            role: true,
                            verify: true,
                            status_account: true,
                            dateOfBirth: true,
                            avatarUrl: true,
                            bio: true,
                            gender: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    },
                    category: true
                }
            });
        } catch (error) {
            throw new BadRequestException({
                status: 400,
                message: 'Failed to create course',
                error: 'Bad Request'
            });
        }
    }

    async updateCourse(id: string, data: UpdateCourseDTO) {
        try {
            const course = await this.prismaService.course.findUnique({
                where: { id }
            });

            if (!course) {
                throw new NotFoundException({
                    status: 404,
                    message: 'Course not found',
                    error: 'Not Found'
                });
            }

            return await this.prismaService.course.update({
                where: { id },
                data: {
                    ...data,
                    categoryId: String(data.categoryId),
                    levelId: String(data.levelId)
                },
                include: {
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            role: true,
                            verify: true,
                            status_account: true,
                            dateOfBirth: true,
                            avatarUrl: true,
                            bio: true,
                            gender: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    },
                }
            });
        } catch (error) {
            throw new BadRequestException({
                status: 400,
                message: 'Failed to update course',
                error: 'Bad Request'
            });
        }
    }

    async deleteCourse(id: string) {
        try {
            const course = await this.prismaService.course.findUnique({
                where: { id }
            });

            if (!course) {
                throw new NotFoundException({
                    status: 404,
                    message: 'Course not found',
                    error: 'Not Found'
                });
            }

            await this.prismaService.course.delete({
                where: { id }
            });

            return { message: 'Course deleted successfully' };
        } catch (error) {
            throw new BadRequestException({
                status: 400,
                message: 'Failed to delete course',
                error: 'Bad Request'
            });
        }
    }
}
