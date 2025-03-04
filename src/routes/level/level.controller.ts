import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, DefaultValuePipe, BadRequestException, NotFoundException, ConflictException, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { LevelService } from './level.service';
import { CreateLevelDto, UpdateLevelDto } from './level.dto';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { VerifiedGuard } from 'src/shared/guards/verified.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';

@Controller('level')
export class LevelController {
    constructor(
        private readonly levelService: LevelService
    ) { }

    @Get()
    async getLevels(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
        if (page < 1) {
            throw new BadRequestException('Page number must be greater than 0');
        }
        if (limit < 1 || limit > 100) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }
        return await this.levelService.getLevels({ page, limit });
    }

    @Post()
    async createLevel(@Body() body: CreateLevelDto) {
        try {
            return await this.levelService.createLevel(body);
        } catch (error) {
            if (error.message === 'Level with this name already exists') {
                throw new ConflictException(error.message);
            }
            throw new InternalServerErrorException('Failed to create level');
        }
    }

    @Patch('/:id')
    async updateLevel(
        @Param('id') id: string,
        @Body() body: UpdateLevelDto
    ) {
        return await this.levelService.updateLevel(Number(id), body);
    }

    @Delete('/:id')
    async deleteLevel(@Param('id') id: string) {
        return await this.levelService.deleteLevel(Number(id));
    }
}