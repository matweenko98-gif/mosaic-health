import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/shop.dto';

/**
 * Магазин глазами покупателя: товары, оформление заказа, свои заказы.
 */
@Controller()
export class ShopController {
  constructor(private readonly shop: ShopService) {}

  @Get('products')
  products(@Query('category') category?: string) {
    return this.shop.listProducts(category);
  }

  @Get('products/:id')
  product(@Param('id', ParseIntPipe) id: number) {
    return this.shop.getProduct(id);
  }

  @Post('orders')
  createOrder(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.shop.createOrder(userId, dto);
  }

  @Get('me/orders')
  myOrders(@CurrentUser('id') userId: string) {
    return this.shop.listMyOrders(userId);
  }
}
