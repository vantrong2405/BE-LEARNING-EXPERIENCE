import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { MediaService } from './media.service'
import { VerifiedGuard } from 'src/shared/guards/verified.guard'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'

@UseGuards(AccessTokenGuard, VerifiedGuard)
@Controller('media')
// @UseGuards(AccessTokenGuard, VerifiedGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new HttpException('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed', HttpStatus.BAD_REQUEST),
            false,
          )
        }
        callback(null, true)
      },
      storage: memoryStorage(),
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return await this.mediaService.uploadImage(file)
  }

  @Post('upload-video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return await this.mediaService.uploadVideo(file)
  }

  @Post('upload-video-hls')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideoHLS(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST)
    }

    const allowedMimeTypes = ['video/mp4', 'video/webm']
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new HttpException('Invalid file type. Only MP4 and WebM are allowed', HttpStatus.BAD_REQUEST)
    }

    return await this.mediaService.uploadVideoHLS(file)
  }

  @Get('video-status/:id')
  async getVideoStatus(@Param('id') id: string) {
    return await this.mediaService.getVideoStatus(id)
  }
}
