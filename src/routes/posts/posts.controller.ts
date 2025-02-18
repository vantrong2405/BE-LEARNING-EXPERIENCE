import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { PostsService } from './posts.service'
import { Auth } from 'src/shared/decorators/auth.decorator'
import { AuthType, ConditionGuard } from 'src/shared/constant/auth.constant'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { CreatePostBodyDTO, GetPostItemDTO, updatePostBodyDTO } from './posts.dto'

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) { }
  @Auth([AuthType.Bearer, AuthType.APIKey], { condition: ConditionGuard.And })
  @Get()
  getPost(@ActiveUser('userId') userId: number) {
    return this.postService.getPosts(userId)
      .then((posts) =>
        posts.map((post) =>
          new GetPostItemDTO(post)))
  }

  // @UseGuards(AccessTokenGuard)
  @Post()
  @Auth([AuthType.Bearer])
  async createPost(@Body() body: CreatePostBodyDTO, @ActiveUser('userId') userId: number) {
    console.log("🚀 ~ PostsController ~ createPost ~ userId:", userId)
    // @ActiveUser('userId') userId: TokenPayload
    return new GetPostItemDTO(await this.postService.createPost(userId, body))
  }

  @Get(':id')
  async getPostId(@Param('id') id: number) {
    return new GetPostItemDTO(await this.postService.getPostId(id))
  }

  @Put(':id')
  @Auth([AuthType.Bearer])
  async updatePost(@Param('id') id: string, @Body() body: updatePostBodyDTO, @ActiveUser('userId') userId: number) {
    return new GetPostItemDTO(await this.postService.updatePost({
      postId: Number(id), body, userId
    }))
  }

  @Delete(':id')
  @Auth([AuthType.Bearer])
  deletePost(@Param('id') id: string, @ActiveUser('userId') userId: number) {
    return this.postService.deletePost({
      postId: Number(id),
      userId
    })
  }
}
