import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { VideoService } from './video.service'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { VerifiedGuard } from 'src/shared/guards/verified.guard'
import { Roles, UserRole } from 'src/shared/decorators/roles.decorator'
import { CreateVideoDto } from './video.dto'

@Controller('video')
@UseGuards(AccessTokenGuard, VerifiedGuard)
@Roles(UserRole.Admin, UserRole.Instructor)
export class VideoController {
  constructor(private readonly videoService: VideoService) { }

  @Post()
  async createVideo(@Body() createVideoDto: CreateVideoDto) {
    return await this.videoService.createVideo(createVideoDto)
  }

  @Get('/lesson/:lessonId')
  async getVideosByLessonId(@Param('lessonId') lessonId: string) {
    return await this.videoService.getVideosByLessonId(lessonId)
  }

  @Patch('/:id')
  async updateVideo(@Param('id') id: string, @Body() body: { videoUrl?: string; duration?: number }) {
    return await this.videoService.updateVideo(id, body)
  }

  @Roles(UserRole.Admin, UserRole.Instructor)
  @Delete('/:id')
  async deleteVideo(@Param('id') id: string) {
    return await this.videoService.deleteVideo(id)
  }
}
