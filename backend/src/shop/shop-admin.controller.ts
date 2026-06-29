import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ShopService } from './shop.service';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateProductDto,
  UpdateOrderStatusDto,
  UpdateProductDto,
} from './dto/shop.dto';

/**
 * Управление магазином — только для администратора.
 */
@Controller('admin')
@Roles(Role.ADMIN)
export class ShopAdminController {
  constructor(private readonly shop: ShopService) {}

  @Get('orders')
  orders() {
    return this.shop.listAllOrders();
  }

  @Patch('orders/:id')
  updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.shop.updateOrderStatus(id, dto.status);
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.shop.createProduct(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.shop.updateProduct(id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.shop.deleteProduct(id);
  }
}
