import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  PaymentStatus,
} from './payment-provider.interface';

const API = 'https://api.yookassa.ru/v3';

/**
 * Провайдер ЮKassa (Россия). Работает по REST API:
 * создание платежа возвращает ссылку на оплату, а статус мы перепроверяем
 * запросом к API (телу webhook не доверяем).
 * Ключи (`YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`) — из окружения.
 */
@Injectable()
export class YookassaProvider implements PaymentProvider {
  readonly name = 'yookassa';
  private readonly logger = new Logger('YookassaProvider');

  constructor(private readonly config: ConfigService) {}

  private authHeader(): string {
    const shopId = this.config.get<string>('YOOKASSA_SHOP_ID');
    const secret = this.config.get<string>('YOOKASSA_SECRET_KEY');
    return 'Basic ' + Buffer.from(`${shopId}:${secret}`).toString('base64');
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const body: Record<string, any> = {
      amount: { value: input.amount.toFixed(2), currency: input.currency },
      capture: true,
      confirmation: { type: 'redirect', return_url: input.returnUrl },
      description: input.description,
      metadata: { orderId: input.orderId },
    };
    if (input.receipt) body.receipt = input.receipt;

    const res = await fetch(`${API}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': randomUUID(),
        Authorization: this.authHeader(),
      },
      body: JSON.stringify(body),
    });
    const data: any = await res.json().catch(() => null);
    if (!res.ok) {
      this.logger.error(`ЮKassa: создание платежа ${res.status}: ${JSON.stringify(data)}`);
      throw new Error(`Ошибка ЮKassa: ${data?.description ?? res.status}`);
    }
    return {
      paymentId: data.id,
      status: data.status,
      confirmationUrl: data.confirmation?.confirmation_url,
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const res = await fetch(`${API}/payments/${paymentId}`, {
      headers: { Authorization: this.authHeader() },
    });
    const data: any = await res.json().catch(() => null);
    if (!res.ok) {
      this.logger.error(`ЮKassa: статус платежа ${res.status}: ${JSON.stringify(data)}`);
      throw new Error(`Ошибка ЮKassa: ${data?.description ?? res.status}`);
    }
    return {
      paymentId: data.id,
      status: data.status,
      paid: data.paid === true && data.status === 'succeeded',
      orderId: data.metadata?.orderId,
      amount: data.amount ? Number(data.amount.value) : undefined,
    };
  }
}
