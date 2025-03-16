import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  UseGuards,
  NotFoundException,
  Request,
} from '@nestjs/common'
import { CoursesService } from './course.service'
import { CreateCourseDTO, UpdateCourseDTO } from './course.dto'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { RolesGuard } from 'src/shared/guards/roles.guard'
import { Roles, UserRole } from 'src/shared/decorators/roles.decorator'
import { VerifiedGuard } from 'src/shared/guards/verified.guard'
import { REQUEST_USER_KEY } from 'src/shared/constant/auth.constant'

@Controller('course')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Get()
  async getCourses(
    @Query('query') query?: string,
    @Query('categoryId', new DefaultValuePipe(undefined)) categoryId?: string,
    @Query('minPrice', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true })) minPrice?: number,
    @Query('maxPrice', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true })) maxPrice?: number,
    @Query('minRating', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true })) minRating?: number,
    @Query('maxRating', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true })) maxRating?: number,
    @Query('levelId', new DefaultValuePipe(undefined)) levelId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0')
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100')
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
      levelId,
    })
  }

  @Get('/:id')
  async getCourseById(@Param('id') id: string) {
    const course = await this.coursesService.getCourseById(id)
    if (!course) {
      throw new NotFoundException('Course not found')
    }
    return course
  }

  @UseGuards(AccessTokenGuard, VerifiedGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Instructor)
  @Post()
  async createCourse(@Body() body: CreateCourseDTO , @Request() req : any) {
      const userId = req[REQUEST_USER_KEY].userId;
      return await this.coursesService.createCourse(body , userId)
  }

  @UseGuards(AccessTokenGuard, VerifiedGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Instructor)
  @Patch('/:id')
  async updateCourse(@Param('id') id: string, @Body() body: UpdateCourseDTO ,  @Request() req : any) {
    const userId = req[REQUEST_USER_KEY].userId;
      return await this.coursesService.updateCourse(id, body , userId)
  }

  @UseGuards(AccessTokenGuard, VerifiedGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Instructor)
  @Delete('/:id')
  async deleteCourse(@Param('id') id: string) {
      return await this.coursesService.deleteCourse(id)
  }
}
