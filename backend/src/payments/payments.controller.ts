import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreatePaymentDto } from './dto/payments.dto';

/**
 * Оплата заказов.
 * - `GET /payments/config` — включена ли онлайн-оплата (фронт решает схему оформления).
 * - `POST /payments/create` — инициировать оплату, вернуть ссылку на оплату.
 * - `POST /payments/webhook/yookassa` — приём уведомлений от ЮKassa (публичный).
 */
@Controller()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Public()
  @Get('payments/config')
  config() {
    return {
      enabled: this.payments.enabled,
      provider: this.payments.providerName,
      currency: this.payments.currency,
    };
  }

  @Post('payments/create')
  create(@CurrentUser('id') userId: string, @Body() dto: CreatePaymentDto) {
    return this.payments.createForOrder(userId, dto.orderId);
  }

  @Public()
  @HttpCode(200)
  @Post('payments/webhook/yookassa')
  yookassaWebhook(@Body() body: any) {
    return this.payments.handleWebhook('yookassa', body);
  }

  @Public()
  @HttpCode(200)
  @Post('payments/webhook/stripe')
  stripeWebhook(@Body() body: any) {
    return this.payments.handleWebhook('stripe', body);
  }
}
