import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { REQUEST_USER_KEY } from 'src/shared/constant/auth.constant';

@Controller('cart')

export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  @UseGuards(AccessTokenGuard)
  async getCart(@Request() req : any) {
    const userId = req[REQUEST_USER_KEY].userId;
    return this.cartService.getCart(userId);
  }
  @Post()
  @UseGuards(AccessTokenGuard)
  async addToCart(
    @Request() req : any,
    @Body() body: { courseId: string },
  ) {
    const userId = req[REQUEST_USER_KEY].userId;
    return this.cartService.addToCart(userId, body.courseId);
  }

  @Delete(':cartId')
  @UseGuards(AccessTokenGuard)
  async removeFromCart(
    @Request() req : any,
    @Param('cartId') cartId: string,
  ) {
    const userId = req[REQUEST_USER_KEY].userId;
    return this.cartService.removeFromCart(userId, cartId);
  }

  @Delete()
  @UseGuards(AccessTokenGuard)
  async clearCart(@Request() req : any) {
    const userId = req[REQUEST_USER_KEY].userId;
    return this.cartService.clearCart(userId);
  }

  @Post('total')
  @UseGuards(AccessTokenGuard)
  async getCartTotal(@Request() req : any, @Body() body: { courseIds: string[] }) {
    const userId = req[REQUEST_USER_KEY].userId;
    return this.cartService.getCartTotal(userId, body.courseIds);
  }
}
