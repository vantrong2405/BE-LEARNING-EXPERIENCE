import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class VideoService {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async createVideo(data: { lessonid: string; videoUrl: string; duration: number }) {
        try {
            return await this.prismaService.video.create({
                data: {
                    lessonId: data.lessonId,
                    videoUrl: data.videoUrl,
                    duration: data.duration
                },
                include: {
                    lesson: true
                }
            });
        } catch (error) {
            throw new Error('Failed to create video');
        }
    }

    async getVideosByLessonId(lessonid: string) {
        try {
            return await this.prismaService.video.findMany({
                where: { lessonId },
                include: {
                    lesson: true
                }
            });
        } catch (error) {
            throw new Error('Failed to fetch videos');
        }
    }

    async updateVideo(id: string, data: { videoUrl?: string; duration?: number }) {
        try {
            const video = await this.prismaService.video.findUnique({
                where: { id }
            });

            if (!video) {
                throw new Error('Video not found');
            }

            return await this.prismaService.video.update({
                where: { id },
                data,
                include: {
                    lesson: true
                }
            });
        } catch (error) {
            throw new Error('Failed to update video');
        }
    }

    async deleteVideo(id: string) {
        try {
            const video = await this.prismaService.video.findUnique({
                where: { id }
            });

            if (!video) {
                throw new Error('Video not found');
            }

            await this.prismaService.video.delete({
                where: { id }
            });

            return { message: 'Video deleted successfully' };
        } catch (error) {
            throw new Error('Failed to delete video');
        }
    }
}