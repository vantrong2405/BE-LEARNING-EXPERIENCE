import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import ffmpeg from 'fluent-ffmpeg'
import {
  UPLOAD_IMAGE_DIR,
  UPLOAD_VIDEO_DIR,
  UPLOAD_IMAGE_TEMP_DIR,
  UPLOAD_VIDEO_TEMP_DIR,
  initFolder,
} from '../../shared/constant/upload.constant'
import envConfig from 'src/shared/config'

export interface VideoStatus {
  id: string
  status: 'processing' | 'completed' | 'failed'
  error?: string
  url?: string
}

@Injectable()
export class MediaService {
  private readonly videoStatuses: Map<string, VideoStatus> = new Map()

  constructor() {
    initFolder([UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR])
    ffmpeg.setFfmpegPath('ffmpeg')
  }

  async uploadImage(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded')
      }
      const fileExt = path.extname(file.originalname)
      const fileName = `${uuidv4()}${fileExt}`
      const filePath = path.join(UPLOAD_IMAGE_DIR, fileName)

      await fs.promises.writeFile(filePath, file.buffer)

      return {
        fileName,
        url: `http://localhost:4000/static/image/${fileName}`,
        mimetype: file.mimetype,
        size: file.size,
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new Error('Failed upload image')
    }
  }

  async uploadVideo(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded')
      }
  
      const allowedMimeTypes = ['video/mp4', 'video/webm']
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type. Only MP4 and WebM are allowed')
      }
      const fileExt = path.extname(file.originalname)
      const fileName = `${uuidv4()}${fileExt}`
      const filePath = path.join(UPLOAD_VIDEO_DIR, fileName)

      await fs.promises.writeFile(filePath, file.buffer)

      return {
        fileName,
        url: `http://localhost:4000/static/video-stream/${fileName}`,
        mimetype: file.mimetype,
        size: file.size,
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new Error('Failed upload videos')
    }
  }

  async uploadVideoHLS(file: Express.Multer.File) {
    try {
      const videoId = uuidv4()
      const outputDir = path.join(UPLOAD_VIDEO_DIR, videoId)
      fs.mkdirSync(outputDir, { recursive: true })

      const inputPath = path.join(UPLOAD_VIDEO_TEMP_DIR, `input_${videoId}${path.extname(file.originalname)}`)
      await fs.promises.writeFile(inputPath, file.buffer)

      this.videoStatuses.set(videoId, {
        id: videoId,
        status: 'processing',
      })

      // Start HLS conversion process
      this.convertToHLS(inputPath, outputDir, videoId)

      return {
        id: videoId,
        status: 'processing',
      }
    } catch (error) {
      throw new HttpException('Error processing video', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  private convertToHLS(inputPath: string, outputDir: string, videoId: string) {
    try {
      // Verify input file exists
      if (!fs.existsSync(inputPath)) {
        throw new Error('Input video file not found')
      }

      // Verify output directory exists and is writable
      if (!fs.existsSync(outputDir)) {
        throw new Error('Output directory not found')
      }

      ffmpeg(inputPath)
        .outputOptions([
          '-profile:v baseline', // Basic H.264 profile for wider device compatibility
          '-level 3.0',
          '-start_number 0',
          '-hls_time 10', // Duration of each segment in seconds
          '-hls_list_size 0', // Keep all segments in the playlist
          '-f hls', // Force HLS output format
          '-hls_segment_filename',
          path.join(outputDir, 'segment%03d.ts'),
          '-codec:v h264', // Video codec
          '-codec:a aac', // Audio codec
          '-ar 48000', // Audio sample rate
          '-b:a 128k', // Audio bitrate
          '-strict experimental',
          '-preset fast', // Encoding speed preset
          '-movflags +faststart', // Enable fast start for web playback
          '-max_muxing_queue_size 1024', // Increase muxing queue size
        ])
        .output(path.join(outputDir, 'playlist.m3u8'))
        .on('start', (commandLine) => {
          console.log('FFmpeg conversion started:', commandLine)
        })
        .on('progress', (progress) => {
          console.log('Processing: ' + progress.percent + '% done')
        })
        .on('end', () => {
          console.log('FFmpeg conversion completed successfully')
          this.videoStatuses.set(videoId, {
            id: videoId,
            status: 'completed',
            url: `http://localhost:4000/static/video-hls/${videoId}/master.m3u8`,
          })
          // Clean up input file
          try {
            fs.unlinkSync(inputPath)
          } catch (cleanupError) {
            console.error('Error cleaning up input file:', cleanupError)
          }
        })
        .on('error', (err) => {
          console.error('FFmpeg conversion error:', err)
          this.videoStatuses.set(videoId, {
            id: videoId,
            status: 'failed',
            error: `FFmpeg conversion failed: ${err.message}`,
          })
          // Clean up input file
          try {
            fs.unlinkSync(inputPath)
          } catch (cleanupError) {
            console.error('Error cleaning up input file:', cleanupError)
          }
        })
        .run()
    } catch (error) {
      console.error('Error in convertToHLS:', error)
      this.videoStatuses.set(videoId, {
        id: videoId,
        status: 'failed',
        error: `Video conversion setup failed: ${error.message}`,
      })
      // Clean up input file
      try {
        fs.unlinkSync(inputPath)
      } catch (cleanupError) {
        console.error('Error cleaning up input file:', cleanupError)
      }
    }
  }

  async getVideoStatus(id: string) {
    const status = this.videoStatuses.get(id)
    if (!status) {
      throw new HttpException('Video not found', HttpStatus.NOT_FOUND)
    }
    return status
  }
}
