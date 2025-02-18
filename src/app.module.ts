import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module';
import { PostsModule } from './routes/posts/posts.module';
import { AuthModule } from './routes/auth/auth.module';
import { CatchEverythingFilter } from './shared/common/http-exception.filter'
@Module({
  imports: [PostsModule, SharedModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: "APP_INTERCEPTOR",
      useClass: ClassSerializerInterceptor
    },
    {
      provide: "APP_FILTER",
      useClass: CatchEverythingFilter
    }
  ],
})
export class AppModule { }
