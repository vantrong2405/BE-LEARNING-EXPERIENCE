import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class CategoryService {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async getCategories({ page, limit }: { page: number; limit: number }) {
        try {
            const skip = (page - 1) * limit;

            const [total, categories] = await Promise.all([
                this.prismaService.category.count(),
                this.prismaService.category.findMany({
                    skip,
                    take: limit,
                    include: {
                        courses: {
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
                                }
                            }
                        }
                    }
                })
            ]);

            const totalPages = Math.ceil(total / limit);

            return {
                data: categories,
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
                message: 'Failed to fetch categories',
                error: 'Bad Request'
            });
        }
    }

    async getCategoryById(id: string) {
        try {
            const category = await this.prismaService.category.findUnique({
                where: { id },
                include: {
                    courses: {
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
                            }
                        }
                    }
                }
            });

            if (!category) {
                throw new NotFoundException({
                    status: 404,
                    message: 'Category not found',
                    error: 'Not Found'
                });
            }

            return category;
        } catch (error) {
            throw new Error('Failed to fetch category');
        }
    }

    async createCategory(data: {
        name: string;
        description?: string;
    }) {
        try {
            return await this.prismaService.category.create({
                data: {
                    name: data.name,
                },
                include: {
                    courses: true
                }
            });
        } catch (error) {
            throw new BadRequestException({
                status: 400,
                message: 'Failed to create category',
                error: 'Bad Request'
            });
        }
    }

    async updateCategory(id: string, data: {
        name?: string;
        description?: string;
    }) {
        try {
            const category = await this.prismaService.category.findUnique({
                where: { id }
            });

            if (!category) {
                throw new NotFoundException({
                    status: 404,
                    message: 'Category not found',
                    error: 'Not Found'
                });
            }

            return await this.prismaService.category.update({
                where: { id },
                data,
                include: {
                    courses: true
                }
            });
        } catch (error) {
            throw new BadRequestException({
                status: 400,
                message: 'Failed to update category',
                error: 'Bad Request'
            });
        }
    }

    async deleteCategory(id: string) {
        try {
            const category = await this.prismaService.category.findUnique({
                where: { id }
            });

            if (!category) {
                throw new NotFoundException({
                    status: 404,
                    message: 'Category not found',
                    error: 'Not Found'
                });
            }

            await this.prismaService.category.delete({
                where: { id }
            });

            return { message: 'Category deleted successfully' };
        } catch (error) {
            throw new BadRequestException({
                status: 400,
                message: 'Failed to delete category',
                error: 'Bad Request'
            });
        }
    }
}