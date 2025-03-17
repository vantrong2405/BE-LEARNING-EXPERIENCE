import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCategories({
    page,
    limit,
    query,
    categoryId,
    minRating,
    maxRating,
    levelId,
  }: {
    page: number
    limit: number
    query?: string
    categoryId?: string
    minRating?: number
    maxRating?: number
    levelId?: string
  }) {
    try {
      const skip = (page - 1) * limit

      const filter: any = {}

      if (query) {
        filter.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      }

      if (categoryId) {
        filter.id = categoryId
      }

      if (minRating || maxRating) {
        filter.courses = {
          some: {
            AND: [minRating ? { rating: { gte: minRating } } : {}, maxRating ? { rating: { lte: maxRating } } : {}],
          },
        }
      }

      if (levelId) {
        filter.courses = {
          ...filter.courses,
          some: {
            ...filter.courses?.some,
            levelId: levelId,
          },
        }
      }

      const [total, categories] = await Promise.all([
        this.prismaService.category.count({ where: filter }),
        this.prismaService.category.findMany({
          where: filter,
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
                    updatedAt: true,
                  },
                },
              },
            },
          },
        }),
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        data: categories,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      }
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: 'Failed to fetch categories',
      })
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
                  updatedAt: true,
                },
              },
            },
          },
        },
      })

      if (!category) {
        throw new NotFoundException({
          status: 404,
          message: 'Category not found',
        })
      }

      return category
    } catch (error) {
      throw new Error('Failed to fetch category')
    }
  }

  async createCategory(data: { name: string; description?: string }) {
    try {
      const category = await this.prismaService.category.findFirst({
        where: {
          name: data.name,
        },
      })

      if (category) {
        throw new BadRequestException({
          status: 400,
          message: 'field name category already exits',
        })
      }
      return await this.prismaService.category.create({
        data: {
          name: data.name,
        },
        include: {
          courses: true,
        },
      })
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error
      }
      throw new Error('Failed to delete category')
    }
  }

  async updateCategory(
    id: string,
    data: {
      name?: string
      description?: string
    },
  ) {
    try {
      const category = await this.prismaService.category.findUnique({
        where: { id },
      })

      if (!category) {
        throw new NotFoundException({
          status: 404,
          message: 'Category not found',
        })
      }

      return await this.prismaService.category.update({
        where: { id },
        data,
        include: {
          courses: true,
        },
      })
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: 'Failed to update category',
      })
    }
  }

  async deleteCategory(id: string) {
    try {
      const category = await this.prismaService.category.findUnique({
        where: { id },
      })

      if (!category) {
        throw new NotFoundException({
          status: 404,
          message: 'Category not found',
        })
      }

      await this.prismaService.category.delete({
        where: { id },
      })

      return { message: 'Category deleted successfully' }
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: 'Failed to delete category',
      })
    }
  }
}
