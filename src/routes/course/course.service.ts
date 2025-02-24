import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class CoursesService {
    constructor(
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
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                email: true,
                                roleId: true,
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
            throw new Error('Failed to fetch courses');
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
                                roleId: true,
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
                                roleId: true,
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

    async getCourseById(id: number) {
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
                            roleId: true,
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
        moneyBackGuarantee?: boolean;
        videoHours?: number;
        articlesCount?: number;
        downloadableResources?: number;
        lifetimeAccess?: boolean;
        certificate?: boolean;
        courseOverview?: string;
        learningObjectives?: string;
        courseFeatures?: string;
        requirements?: string;
        levelId?: number;
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
                    isPublished: data.isPublished ?? false,
                    moneyBackGuarantee: data.moneyBackGuarantee ?? true,
                    videoHours: data.videoHours ?? 0,
                    articlesCount: data.articlesCount ?? 0,
                    downloadableResources: data.downloadableResources ?? 0,
                    lifetimeAccess: data.lifetimeAccess ?? true,
                    certificate: data.certificate ?? true,
                    courseOverview: data.courseOverview,
                    learningObjectives: data.learningObjectives,
                    courseFeatures: data.courseFeatures,
                    requirements: data.requirements,
                    levelId: data.levelId
                },
                include: {
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            roleId: true,
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
        moneyBackGuarantee?: boolean;
        videoHours?: number;
        articlesCount?: number;
        downloadableResources?: number;
        lifetimeAccess?: boolean;
        certificate?: boolean;
        courseOverview?: string;
        learningObjectives?: string;
        courseFeatures?: string;
        requirements?: string;
        levelId?: number;
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
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true,
                            roleId: true,
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
