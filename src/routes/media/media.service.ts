import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as ffmpeg from 'fluent-ffmpeg';
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR, initFolder } from '../../shared/constant/upload.constant';
import envConfig from 'src/shared/config';

export interface VideoStatus {
    id: string;
    status: 'processing' | 'completed' | 'failed';
    error?: string;
}

@Injectable()
export class MediaService {
    private readonly videoStatuses: Map<string, VideoStatus> = new Map();

    constructor() {
        initFolder([UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR]);
    }

    async uploadImage(file: Express.Multer.File) {
        try {
            const fileExt = path.extname(file.originalname);
            const fileName = `${uuidv4()}${fileExt}`;
            const filePath = path.join(UPLOAD_IMAGE_DIR, fileName);

            await fs.promises.writeFile(filePath, file.buffer);

            return {
                fileName,
                url: `http://localhost:${envConfig.PORT}/uploads/images/${fileName}`,
                mimetype: file.mimetype,
                size: file.size
            };
        } catch (error) {
            throw new HttpException('Error uploading image', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadVideo(file: Express.Multer.File) {
        try {
            const fileExt = path.extname(file.originalname);
            const fileName = `${uuidv4()}${fileExt}`;
            const filePath = path.join(UPLOAD_VIDEO_DIR, fileName);

            await fs.promises.writeFile(filePath, file.buffer);

            return {
                fileName,
                url: `http://localhost:${envConfig.PORT}/uploads/videos/${fileName}`,
                mimetype: file.mimetype,
                size: file.size
            };
        } catch (error) {
            throw new HttpException('Error uploading video', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadVideoHLS(file: Express.Multer.File) {
        try {
            const videoId = uuidv4();
            const outputDir = path.join(UPLOAD_VIDEO_DIR, videoId);
            fs.mkdirSync(outputDir, { recursive: true });

            const inputPath = path.join(UPLOAD_VIDEO_TEMP_DIR, `input_${videoId}${path.extname(file.originalname)}`);
            await fs.promises.writeFile(inputPath, file.buffer);

            this.videoStatuses.set(videoId, {
                id: videoId,
                status: 'processing'
            });

            // Start HLS conversion process
            this.convertToHLS(inputPath, outputDir, videoId);

            return {
                id: videoId,
                status: 'processing'
            };
        } catch (error) {
            throw new HttpException('Error processing video', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private convertToHLS(inputPath: string, outputDir: string, videoId: string) {
        ffmpeg(inputPath)
            .outputOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 10',
                '-hls_list_size 0',
                '-f hls'
            ])
            .output(path.join(outputDir, 'playlist.m3u8'))
            .on('end', () => {
                this.videoStatuses.set(videoId, {
                    id: videoId,
                    status: 'completed'
                });
                // Clean up input file
                fs.unlinkSync(inputPath);
            })
            .on('error', (err) => {
                this.videoStatuses.set(videoId, {
                    id: videoId,
                    status: 'failed',
                    error: err.message
                });
                // Clean up input file
                fs.unlinkSync(inputPath);
            })
            .run();
    }

    async getVideoStatus(id: string) {
        const status = this.videoStatuses.get(id);
        if (!status) {
            throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
        }
        return status;
    }
}
