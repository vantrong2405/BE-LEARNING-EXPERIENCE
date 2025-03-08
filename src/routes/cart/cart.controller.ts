import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { REQUEST_USER_KEY } from 'src/shared/constant/auth.constant';

@Controller('cart')

export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  @UseGuards(AccessTokenGuard)
  async getCart(@Request() req) {
    const userId = req[REQUEST_USER_KEY].userId;
    console.log("🚀 ~ CartController ~ getCart ~ userId:", userId)
    return this.cartService.getCart(userId);
  }
  @Post(':courseId')
  @UseGuards(AccessTokenGuard)
  async addToCart(
    @Request() req,
    @Body() body: { courseId: string },
  ) {
    const userId = req[REQUEST_USER_KEY].userId;
    return this.cartService.addToCart(userId, body.courseId);
  }

  @Delete(':courseId')
  @UseGuards(AccessTokenGuard)
  async removeFromCart(
    @Request() req,
    @Param('courseId') courseId: string,
  ) {
    const userId = req[REQUEST_USER_KEY].userId;
    return this.cartService.removeFromCart(userId, courseId);
  }

  @Delete()
  @UseGuards(AccessTokenGuard)
  async clearCart(@Request() req) {
    const userId = req[REQUEST_USER_KEY].userId;
    return this.cartService.clearCart(userId);
  }

  @Get('total')
  @UseGuards(AccessTokenGuard)
  async getCartTotal(@Request() req) {
    const userId = req[REQUEST_USER_KEY].userId;
    return this.cartService.getCartTotal(userId);
  }
}
