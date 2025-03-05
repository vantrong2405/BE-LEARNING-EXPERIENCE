import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common'
import { createReadStream, existsSync } from 'fs'
import { join } from 'path'
import { stat } from 'fs/promises'

@Injectable()
export class StaticService {
  private readonly uploadDir = 'uploads'

  getImagePath(filename: string): string {
    return join(process.cwd(), this.uploadDir, 'images', filename)
  }

  getVideoPath(filename: string): string {
    const videoPath = join(process.cwd(), this.uploadDir, 'videos', filename)
    if (!existsSync(videoPath)) {
      throw new NotFoundException('Video not found')
    }
    return videoPath
  }

  getHlsPath(id: string, version?: string, segment?: string): string {
    let hlsPath: string
    if (segment && version) {
      hlsPath = join(process.cwd(), this.uploadDir, 'videos', id, version, segment)
    } else {
      hlsPath = join(process.cwd(), this.uploadDir, 'videos', id, 'playlist.m3u8')
    }
    if (!existsSync(hlsPath)) {
      throw new NotFoundException('HLS content not found')
    }
    return hlsPath
  }

  async serveImage(filename: string): Promise<StreamableFile> {
    const imagePath = join(process.cwd(), this.uploadDir, 'images', filename)

    if (!existsSync(imagePath)) {
      throw new NotFoundException('Image not found')
    }

    const file = createReadStream(imagePath)
    return new StreamableFile(file)
  }

  async serveVideo(filename: string): Promise<StreamableFile> {
    const videoPath = join(process.cwd(), this.uploadDir, 'videos', filename)

    if (!existsSync(videoPath)) {
      throw new NotFoundException('Video not found')
    }

    const file = createReadStream(videoPath)
    return new StreamableFile(file)
  }

  async getFileStats(filename: string, type: 'images' | 'videos') {
    const filePath = join(process.cwd(), this.uploadDir, type, filename)

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found')
    }

    return stat(filePath)
  }
}
