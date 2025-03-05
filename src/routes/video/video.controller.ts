import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { VerifiedGuard } from 'src/shared/guards/verified.guard';

@Controller('video')
@UseGuards(AccessTokenGuard, VerifiedGuard)
export class VideoController {
    constructor(
        private readonly videoService: VideoService
    ) { }

    @Post()
    async createVideo(@Body() body: { lessonid: string; videoUrl: string; duration: number }) {
        return await this.videoService.createVideo(body);
    }

    @Get('/lesson/:lessonId')
    async getVideosByLessonId(@Param('lessonId') lessonId: string) {
        return await this.videoService.getVideosByLessonId(Number(lessonId));
    }

    @Patch('/:id')
    async updateVideo(
        @Param('id') id: string,
        @Body() body: { videoUrl?: string; duration?: number }
    ) {
        return await this.videoService.updateVideo(Number(id), body);
    }

    @Delete('/:id')
    async deleteVideo(@Param('id') id: string) {
        return await this.videoService.deleteVideo(Number(id));
    }
}