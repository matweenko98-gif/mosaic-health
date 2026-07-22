import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOrderDto,
  CreateProductDto,
  UpdateProductDto,
} from './dto/shop.dto';

@Injectable()
export class ShopService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Товары ----------
  listProducts(category?: string) {
    return this.prisma.product.findMany({
      where: category ? { category } : {},
      orderBy: { id: 'asc' },
    });
  }

  async getProduct(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Товар не найден');
    return product;
  }

  createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    await this.getProduct(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async deleteProduct(id: number) {
    await this.getProduct(id);
    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }

  // ---------- Заказы ----------
  async createOrder(userId: string | null, dto: CreateOrderDto) {
    const ids = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({ where: { id: { in: ids } } });
    const byId = new Map(products.map((p) => [p.id, p]));

    // Цену берём из базы (не доверяем клиенту), считаем итог на сервере.
    const itemsData = dto.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) throw new BadRequestException(`Товар ${item.productId} не найден`);
      return {
        productId: product.id,
        name: product.name_ru || product.name_en || '',
        price: product.price,
        quantity: item.quantity,
      };
    });
    const total = itemsData.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return this.prisma.order.create({
      data: {
        userId: userId ?? undefined,
        recipientName: dto.recipientName,
        phone: dto.phone,
        address: dto.address,
        total,
        items: { create: itemsData },
      },
      include: { items: true },
    });
  }

  listMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAllOrders() {
    return this.prisma.order.findMany({
      include: { items: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Заказ не найден');
    return this.prisma.order.update({ where: { id }, data: { status }, include: { items: true } });
  }
}
