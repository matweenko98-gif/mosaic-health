import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  PaymentStatus,
} from './payment-provider.interface';

/**
 * Провайдер Stripe (юрлицо ОАЭ) — основной для рынка Дубай + Черногория.
 * Использует Stripe Checkout (hosted-страница оплаты): создаём сессию,
 * возвращаем ссылку, а статус перепроверяем запросом к API (как у ЮKassa).
 * Ключ — `STRIPE_SECRET_KEY` из окружения.
 */
@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe';
  private readonly logger = new Logger('StripeProvider');
  private client: Stripe | null = null;

  constructor(private readonly config: ConfigService) {}

  private get stripe(): Stripe {
    if (!this.client) {
      const key = this.config.get<string>('STRIPE_SECRET_KEY');
      if (!key) throw new Error('STRIPE_SECRET_KEY не задан');
      this.client = new Stripe(key);
    }
    return this.client;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    // Stripe принимает сумму в минимальных единицах (филсы/центы) — умножаем на 100.
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: Math.round(input.amount * 100),
            product_data: { name: input.description },
          },
        },
      ],
      success_url: input.returnUrl,
      cancel_url: input.cancelUrl ?? input.returnUrl,
      metadata: { orderId: input.orderId },
      client_reference_id: input.orderId,
    });
    return {
      paymentId: session.id,
      status: session.status ?? 'open',
      confirmationUrl: session.url ?? '',
    };
  }

  extractWebhookPaymentId(body: any): string | undefined {
    // Stripe шлёт событие вида { type, data: { object: { id } } }.
    return body?.data?.object?.id;
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return {
      paymentId: session.id,
      status: session.payment_status, // 'paid' | 'unpaid' | 'no_payment_required'
      paid: session.payment_status === 'paid',
      orderId: (session.metadata?.orderId as string) || undefined,
      amount: session.amount_total != null ? session.amount_total / 100 : undefined,
    };
  }
}
