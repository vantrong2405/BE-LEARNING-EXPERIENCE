import { Module } from '@nestjs/common'
import { VideoController } from './video.controller'
import { VideoService } from './video.service'
import { PrismaService } from 'src/shared/services/prisma.service'

@Module({
  controllers: [VideoController],
  providers: [VideoService, PrismaService],
  exports: [VideoService],
})
export class VideoModule {}
