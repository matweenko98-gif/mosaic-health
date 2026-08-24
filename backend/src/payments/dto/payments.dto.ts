import { IsString } from 'class-validator';

/** Инициализация оплаты по уже созданному заказу. */
export class CreatePaymentDto {
  @IsString() orderId: string;
}
