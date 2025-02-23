import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, DefaultValuePipe, BadRequestException, UseGuards } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { VerifiedGuard } from 'src/shared/guards/verified.guard';
import { CreateLessonDTO, UpdateLessonDTO } from './lesson.dto';

@Controller('lesson')
export class LessonController {
    constructor(
        private readonly lessonService: LessonService
    ) { }

    @Get('/course/:courseId')
    async getLessonsByCourseId(
        @Param('courseId') courseId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
        if (page < 1) {
            throw new BadRequestException('Page number must be greater than 0');
        }
        if (limit < 1 || limit > 100) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }
        return await this.lessonService.getLessonsByCourseId(Number(courseId), { page, limit });
    }

    @UseGuards(AccessTokenGuard, VerifiedGuard)
    @Post()
    async createLesson(@Body() body: CreateLessonDTO) {
        return await this.lessonService.createLesson(body);
    }

    @UseGuards(AccessTokenGuard, VerifiedGuard)
    @Patch('/:id')
    async updateLesson(@Param('id') id: string, @Body() body: UpdateLessonDTO) {
        return await this.lessonService.updateLesson(Number(id), body);
    }

    @UseGuards(AccessTokenGuard, VerifiedGuard)
    @Delete('/:id')
    async deleteLesson(@Param('id') id: string) {
        return await this.lessonService.deleteLesson(Number(id));
    }
}
