import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  DefaultValuePipe,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common'
import { LevelService } from './level.service'
import { CreateLevelDto, UpdateLevelDto } from './level.dto'
import { Roles, UserRole } from 'src/shared/decorators/roles.decorator'

@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Get()
  async getLevels(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(10)) limit: number,
  ) {
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0')
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100')
    }
    return await this.levelService.getLevels({ page, limit })
  }

  @Post()
  @Roles(UserRole.Admin)
  async createLevel(@Body() body: CreateLevelDto) {
    try {
      return await this.levelService.createLevel(body)
    } catch (error) {
      if (error.message === 'Level with this name already exists') {
        throw new ConflictException(error.message)
      }
      throw new InternalServerErrorException('Failed to create level')
    }
  }

  @Patch('/:id')
  async updateLevel(@Param('id') id: string, @Body() body: UpdateLevelDto) {
    return await this.levelService.updateLevel(id, body)
  }

  @Delete('/:id')
  async deleteLevel(@Param('id') id: string) {
    return await this.levelService.deleteLevel(id)
  }
}
