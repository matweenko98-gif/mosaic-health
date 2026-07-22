import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class OrderItemDto {
  @IsInt() productId: number;
  @IsInt() @Min(1) quantity: number;
}

export class CreateOrderDto {
  @IsString() recipientName: string;
  @IsString() phone: string;
  @IsString() address: string;
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsIn(Object.values(OrderStatus))
  status: OrderStatus;
}

export class CreateProductDto {
  @IsString() name_ru: string;
  @IsOptional() @IsString() name_en?: string;
  @IsInt() @Min(0) price: number;
  @IsOptional() @IsString() description_ru?: string;
  @IsOptional() @IsString() description_en?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() imageKey?: string;
  @IsOptional() @IsBoolean() inStock?: boolean;
}

export class UpdateProductDto {
  @IsOptional() @IsString() name_ru?: string;
  @IsOptional() @IsString() name_en?: string;
  @IsOptional() @IsInt() @Min(0) price?: number;
  @IsOptional() @IsString() description_ru?: string;
  @IsOptional() @IsString() description_en?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() imageKey?: string;
  @IsOptional() @IsBoolean() inStock?: boolean;
}
