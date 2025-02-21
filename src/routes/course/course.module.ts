import { Module } from '@nestjs/common';
import { CoursesController } from './course.controller';
import { CoursesService } from './course.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService]
})
export class CoursesModule { }
