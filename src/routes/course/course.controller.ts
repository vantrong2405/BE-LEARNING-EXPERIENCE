import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, DefaultValuePipe, BadRequestException, UseGuards } from '@nestjs/common';
import { CoursesService } from './course.service';
import { CreateCourseDTO, UpdateCourseDTO } from './course.dto';
import { VerifiedGuard } from 'src/shared/guards/verified.guard';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';

@Controller('course')
@UseGuards(AccessTokenGuard, VerifiedGuard)
export class CoursesController {
    constructor(
        private readonly coursesService: CoursesService
    ) { }

    @Get()
    async getCourse(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
        if (page < 1) {
            throw new BadRequestException('Page number must be greater than 0');
        }
        if (limit < 1 || limit > 100) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }
        return await this.coursesService.getCourse({ page, limit });
    }

    @Get('/:id')
    async getCourseById(@Param('id') id: string) {
        return await this.coursesService.getCourseById(Number(id))
    }

    @Post()
    async createCourse(@Body() body: CreateCourseDTO) {
        return await this.coursesService.createCourse(body)
    }

    @Patch('/:id')
    async updateCourse(@Param('id') id: string, @Body() body: UpdateCourseDTO) {
        return await this.coursesService.updateCourse(Number(id), body)
    }

    @Delete('/:id')
    async deleteCourse(@Param('id') id: string) {
        return await this.coursesService.deleteCourse(Number(id))
    }

}
