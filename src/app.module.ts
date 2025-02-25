import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './routes/auth/auth.module';
import { CoursesModule } from './routes/course/course.module';
import { CategoryModule } from './routes/category/category.module';
import { MediaModule } from './routes/media/media.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_FILTER } from '@nestjs/core';
import { StaticModule } from './routes/static/static.module';
import { LessonModule } from './routes/lesson/lesson.module';
import { LeverModule } from './routes/level/lever.module';
@Module({
  imports: [SharedModule, AuthModule, CoursesModule, CategoryModule, MediaModule, LessonModule, LeverModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        fallthrough: true
      }
    }),
    StaticModule,
    LessonModule,],
  controllers: [],
  providers: [
    {
      provide: "APP_INTERCEPTOR",
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class AppModule { }
