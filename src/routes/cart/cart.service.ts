import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class CartService {
    constructor(private readonly prismaService: PrismaService) { }

    async getCart(userId: string) {
        // First check if user exists
        const user = await this.prismaService.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const cart = await this.prismaService.cart.findUnique({
            where: { userId },
            include: {
                cartItems: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                thumbnailUrl: true,
                                price: true,
                                instructor: {
                                    select: {
                                        id: true,
                                        name: true,
                                        avatarUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!cart) {
            return await this.prismaService.cart.create({
                data: { userId },
                include: {
                    cartItems: {
                        include: {
                            course: {
                                select: {
                                    id: true,
                                    title: true,
                                    description: true,
                                    thumbnailUrl: true,
                                    price: true,
                                    instructor: {
                                        select: {
                                            id: true,
                                            name: true,
                                            avatarUrl: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        return cart;
    }

    async addToCart(userId: string, courseId: string) {
      try {
        const cart = await this.getCart(userId);
        const course = await this.prismaService.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Check if user already enrolled in the course
        const enrollment = await this.prismaService.enrollment.findFirst({
            where: {
                userId,
                courseId
            }
        });

        if (enrollment) {
            throw new ConflictException('You are already enrolled in this course');
        }

        // Check if course is already in cart
        const existingCartItem = await this.prismaService.cartItem.findUnique({
            where: {
                cartId_courseId: {
                    cartId: cart.id,
                    courseId
                }
            }
        });

        if (existingCartItem) {
            throw new ConflictException('Course is already in cart');
        }

        return await this.prismaService.cartItem.create({
            data: {
                cartId: cart.id,
                courseId,
                price: course.price
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnailUrl: true,
                        price: true,
                        instructor: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true
                            }
                        }
                    }
                }
            }
        });
      } catch (error) {
        if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) {
            throw error
          }
          throw new Error('Failed to create cart')
      }
    }

    async removeFromCart(userId: string, courseId: string) {
        try {
            // Tìm kiếm cartItem dựa trên userId và courseId
            const cartItem = await this.prismaService.cartItem.findFirst({
                where: {
                    cart: {
                        userId: userId // Kiểm tra cart của người dùng
                    },
                    courseId: courseId // Tìm khóa học trong cart
                }
            });

            console.log("🚀 ~ CartService ~ removeFromCart ~ cartItem:", cartItem);

            if (!cartItem) {
                throw new NotFoundException('Course not found in cart');
            }

            await this.prismaService.cartItem.delete({
                where: {
                    id: cartItem.id 
                }
            });

            return { message: 'Course removed from cart successfully' };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new Error('Failed to delete cart');
        }
    }

    async clearCart(userId: string) {
        const cart = await this.getCart(userId);

        await this.prismaService.cartItem.deleteMany({
            where: {
                cartId: cart.id
            }
        });

        return { message: 'Cart cleared successfully' };
    }

    async getCartTotal(userId: string, courseIds: string[]) {
        const cart = await this.getCart(userId);

        // Validate that all courses exist and are in the cart
        const cartItems = await this.prismaService.cartItem.findMany({
            where: {
                cartId: cart.id,
                courseId: {
                    in: courseIds
                }
            }
        });

        if (cartItems.length !== courseIds.length) {
            throw new NotFoundException('One or more courses not found in cart');
        }

        const total = cartItems.reduce((sum, item) => sum + item.price, 0);
        return { total };
    }
}