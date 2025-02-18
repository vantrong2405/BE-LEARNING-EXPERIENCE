import { Module } from '@nestjs/common'
import { PostsController } from './posts.controller'
import { PostsService } from './posts.service'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
@Module({
  controllers: [PostsController],
  providers: [PostsService, AuthenticationGuard],
})
export class PostsModule { }
