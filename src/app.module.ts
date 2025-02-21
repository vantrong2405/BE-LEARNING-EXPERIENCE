import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './routes/auth/auth.module';
import { CatchEverythingFilter } from './shared/common/http-exception.filter'
import { CoursesModule } from './routes/course/course.module';
import { CategoryModule } from './routes/category/category.module';
import { MediaModule } from './routes/media/media.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_FILTER } from '@nestjs/core';
import { StaticModule } from './routes/static/static.module';
@Module({
  imports: [SharedModule, AuthModule, CoursesModule, CategoryModule, MediaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        fallthrough: true
      }
    }),
    StaticModule,],
  controllers: [],
  providers: [
    {
      provide: "APP_INTERCEPTOR",
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter
    }
  ]
})
export class AppModule { }
