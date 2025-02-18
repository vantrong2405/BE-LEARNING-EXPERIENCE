import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreatePostBodyDTO, updatePostBodyDTO } from './posts.dto';
import { isNotFoundPrismaError } from 'src/shared/helpers';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) { }
  getPosts(userId: number) {
    return this.prismaService.post.findMany({
      where: {
        authorId: userId
      },
      include: {
        author: {
          omit: {
            password: true
          }
        }
      }
    })
  }

  createPost(userId: number, body: CreatePostBodyDTO) {
    return this.prismaService.post.create({
      data: {
        content: body.content,
        title: body.title,
        authorId: userId
      },
      include: {
        author: {
          omit: {
            password: true
          }
        }
      }
    })
  }

  getPostId(postId: number) {
    return this.prismaService.post.findFirstOrThrow({
      where: {
        id: postId
      },
      include: {
        author: {
          omit: {
            password: true
          }
        }
      }
    })
  }

  async updatePost({
    postId, body, userId
  }: { postId: number, body: updatePostBodyDTO, userId: number }) {
    try {
      const post = await this.prismaService.post.update({
        where: {
          id: postId,
          authorId: userId
        },
        data: {
          content: body.content,
          title: body.title
        },
        include: {
          author: {
            omit: {
              password: true
            }
          }
        }
      })
      return post
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException('Post not found')
      }
      throw error
    }
  }

  async deletePost({ postId, userId }: { postId: number, userId: number }) {
    await this.prismaService.post.delete({
      where: {
        id: postId,
        authorId: userId
      }
    })
  }
}
