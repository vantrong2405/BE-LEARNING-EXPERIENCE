import { Injectable } from '@nestjs/common';
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
                        courses: true
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
            throw new Error('Failed to fetch categories');
        }
    }

    async getCategoryById(id: number) {
        try {
            const category = await this.prismaService.category.findUnique({
                where: { id },
                include: {
                    courses: true
                }
            });

            if (!category) {
                throw new Error('Category not found');
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
            throw new Error('Failed to create category');
        }
    }

    async updateCategory(id: number, data: {
        name?: string;
        description?: string;
    }) {
        try {
            const category = await this.prismaService.category.findUnique({
                where: { id }
            });

            if (!category) {
                throw new Error('Category not found');
            }

            return await this.prismaService.category.update({
                where: { id },
                data,
                include: {
                    courses: true
                }
            });
        } catch (error) {
            throw new Error('Failed to update category');
        }
    }

    async deleteCategory(id: number) {
        try {
            const category = await this.prismaService.category.findUnique({
                where: { id }
            });

            if (!category) {
                throw new Error('Category not found');
            }

            await this.prismaService.category.delete({
                where: { id }
            });

            return { message: 'Category deleted successfully' };
        } catch (error) {
            throw new Error('Failed to delete category');
        }
    }
}