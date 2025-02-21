import { Controller, Get, HttpException, Param, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, statSync } from 'fs';
import { StaticService } from './static.service';

@Controller('static')
export class StaticController {
    constructor(private readonly staticService: StaticService) { }

    @Get('/image/:name')
    async getImage(@Param('name') name: string, @Res() res: Response) {
        try {
            const imagePath = this.staticService.getImagePath(name);
            const stat = statSync(imagePath);
            const fileStream = createReadStream(imagePath);
            res.set({
                'Content-Type': 'image/*',
                'Content-Length': stat.size,
            });
            fileStream.pipe(res);
        } catch (error) {
            if (error instanceof HttpException) {
                res.status(error.getStatus()).send(error.message);
            } else {
                res.status(500).send('Internal server error');
            }
        }
    }

    @Get('/video-stream/:name')
    async streamVideo(@Param('name') name: string, @Res() res: Response) {
        try {
            const videoPath = this.staticService.getVideoPath(name);
            const stat = statSync(videoPath);
            const fileStream = createReadStream(videoPath);
            res.set({
                'Content-Type': 'video/mp4',
                'Content-Length': stat.size,
            });
            fileStream.pipe(res);
        } catch (error) {
            if (error instanceof HttpException) {
                res.status(error.getStatus()).send(error.message);
            } else {
                res.status(500).send('Internal server error');
            }
        }
    }

    @Get('/video-hls/:id/master.m3u8')
    async getHlsMaster(@Param('id') id: string, @Res() res: Response) {
        try {
            const hlsPath = this.staticService.getHlsPath(id);
            const stat = statSync(hlsPath);
            const fileStream = createReadStream(hlsPath);
            res.set({
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Content-Length': stat.size,
            });
            fileStream.pipe(res);
        } catch (error) {
            if (error instanceof HttpException) {
                res.status(error.getStatus()).send(error.message);
            } else {
                res.status(500).send('Internal server error');
            }
        }
    }

    @Get('/video-hls/:id/:v/:segment')
    async getHlsSegment(
        @Param('id') id: string,
        @Param('v') version: string,
        @Param('segment') segment: string,
        @Res() res: Response
    ) {
        try {
            const segmentPath = this.staticService.getHlsPath(id, version, segment);
            const stat = statSync(segmentPath);
            const fileStream = createReadStream(segmentPath);
            res.set({
                'Content-Type': 'video/MP2T',
                'Content-Length': stat.size,
            });
            fileStream.pipe(res);
        } catch (error) {
            if (error instanceof HttpException) {
                res.status(error.getStatus()).send(error.message);
            } else {
                res.status(500).send('Internal server error');
            }
        }
    }
}
