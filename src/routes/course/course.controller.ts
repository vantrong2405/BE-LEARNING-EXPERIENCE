import { Body, Controller, Delete, Get, Param, Patch, Post, Query, ParseIntPipe, DefaultValuePipe, BadRequestException, UseGuards } from '@nestjs/common';
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

    @Get('/search')
    async searchCourses(
        @Query('query') query: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
        if (page < 1) {
            throw new BadRequestException('Page number must be greater than 0');
        }
        if (limit < 1 || limit > 100) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }
        return await this.coursesService.searchCourses(query, { page, limit });
    }

    @Get('/filter')
    async filterCourses(
        @Query('categoryId', new ParseIntPipe) categoryId?: number,
        @Query('minPrice', new ParseIntPipe) minPrice?: number,
        @Query('maxPrice', new ParseIntPipe) maxPrice?: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
        if (page < 1) {
            throw new BadRequestException('Page number must be greater than 0');
        }
        if (limit < 1 || limit > 100) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }
        return await this.coursesService.filterCourses(
            { categoryId, priceRange: minPrice && maxPrice ? [minPrice, maxPrice] : undefined },
            { page, limit }
        );
    }

    @Get('/:id')
    async getCourseById(@Param('id') id: string) {
        return await this.coursesService.getCourseById(Number(id))
    }

    // @UseGuards(AccessTokenGuard, VerifiedGuard)
    @Post()
    async createCourse(@Body() body: CreateCourseDTO) {
        return await this.coursesService.createCourse(body)
    }

    // @UseGuards(AccessTokenGuard, VerifiedGuard)
    @Patch('/:id')
    async updateCourse(@Param('id') id: string, @Body() body: UpdateCourseDTO) {
        return await this.coursesService.updateCourse(Number(id), body)
    }

    // @UseGuards(AccessTokenGuard, VerifiedGuard)
    @Delete('/:id')
    async deleteCourse(@Param('id') id: string) {
        return await this.coursesService.deleteCourse(Number(id))
    }

}
