import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class LevelService {
  constructor(private readonly prismaService: PrismaService) {}

  async getLevels({ page, limit }: { page: number; limit: number }) {
    try {
      const skip = (page - 1) * limit

      const [total, levels] = await Promise.all([
        this.prismaService.level.count(),
        this.prismaService.level.findMany({
          skip,
          take: limit,
          include: {
            courses: {
              select: {
                id: true,
                title: true,
                description: true,
              },
            },
          },
        }),
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        data: levels,
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
        message: 'Failed to fetch levels',
      })
    }
  }

  async createLevel(data: { name: string; description?: string }) {
    try {
      const existingLevel = await this.prismaService.level.findFirst({
        where: { name: data.name },
      })

      if (existingLevel) {
        throw new ConflictException({
          status: 409,
          message: 'Level with this name already exists',
        })
      }

      return await this.prismaService.level.create({
        data,
      })
    } catch (error) {
      if (error.message === 'Level with this name already exists') {
        throw new Error(error.message)
      }
      if (error.code === 'P2002') {
        throw new ConflictException({
          status: 409,
          message: 'Level with this name already exists',
        })
      }
      throw new Error('Failed to create level: ' + error.message)
    }
  }

  async updateLevel(id: string, data: { name?: string; description?: string }) {
    try {
      const level = await this.prismaService.level.findUnique({
        where: { id },
        include: {
          courses: true,
        },
      })

      if (!level) {
        throw new NotFoundException({
          status: 404,
          message: 'Level not found',
        })
      }

      return await this.prismaService.level.update({
        where: { id },
        data,
      })
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: 'Failed to update level',
      })
    }
  }

  async deleteLevel(id: string) {
    try {
      const level = await this.prismaService.level.findUnique({
        where: { id },
      })

      if (!level) {
        throw new NotFoundException({
          status: 404,
          message: 'Level not found',
        })
      }

      await this.prismaService.level.delete({
        where: { id },
      })

      return { message: 'Level deleted successfully' }
    } catch (error) {
      throw new BadRequestException({
        status: 400,
        message: 'Failed to delete level',
      })
    }
  }
}
