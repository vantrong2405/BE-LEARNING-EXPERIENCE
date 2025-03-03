import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, DefaultValuePipe, BadRequestException, UseGuards, NotFoundException } from '@nestjs/common';
import { CoursesService } from './course.service';
import { CreateCourseDTO, UpdateCourseDTO } from './course.dto';
import { VerifiedGuard } from 'src/shared/guards/verified.guard';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';

@Controller('course')

export class CoursesController {
    constructor(
        private readonly coursesService: CoursesService
    ) { }

    @Get()
    async getCourses(
        @Query('query') query?: string,
        @Query('categoryId', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true })) categoryId?: number,
        @Query('minPrice', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true })) minPrice?: number,
        @Query('maxPrice', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true })) maxPrice?: number,
        @Query('minRating', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true })) minRating?: number,
        @Query('maxRating', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true })) maxRating?: number,
        @Query('levelId', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true })) levelId?: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
        if (page < 1) {
            throw new BadRequestException('Page number must be greater than 0');
        }
        if (limit < 1 || limit > 100) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }

        return await this.coursesService.getCourse({
            page,
            limit,
            query,
            categoryId,
            minPrice,
            maxPrice,
            minRating,
            maxRating,
            levelId
        });
    }

    @Get('/:id')
    async getCourseById(@Param('id', ParseIntPipe) id: number) {
        const course = await this.coursesService.getCourseById(id);
        if (!course) {
            throw new NotFoundException('Course not found');
        }
        return course;
    }

    @UseGuards(AccessTokenGuard, VerifiedGuard)
    @Post()
    async createCourse(@Body() body: CreateCourseDTO) {
        try {
            return await this.coursesService.createCourse(body);
        } catch (error) {
            throw new BadRequestException('Failed to create course');
        }
    }

    @UseGuards(AccessTokenGuard, VerifiedGuard)
    @Patch('/:id')
    async updateCourse(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCourseDTO) {
        const course = await this.coursesService.getCourseById(id);
        if (!course) {
            throw new NotFoundException('Course not found');
        }
        try {
            return await this.coursesService.updateCourse(id, body);
        } catch (error) {
            throw new BadRequestException('Failed to update course');
        }
    }

    @UseGuards(AccessTokenGuard, VerifiedGuard)
    @Delete('/:id')
    async deleteCourse(@Param('id', ParseIntPipe) id: number) {
        const course = await this.coursesService.getCourseById(id);
        if (!course) {
            throw new NotFoundException('Course not found');
        }
        try {
            return await this.coursesService.deleteCourse(id);
        } catch (error) {
            throw new BadRequestException('Failed to delete course');
        }
    }
}
