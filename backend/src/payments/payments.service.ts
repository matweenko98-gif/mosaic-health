import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { YookassaProvider } from './providers/yookassa.provider';
import { StripeProvider } from './providers/stripe.provider';
import { PaymentProvider, ReceiptData } from './providers/payment-provider.interface';

/**
 * Оплата заказов. Провайдер выбирается настройкой `PAYMENTS_PROVIDER`
 * (`stripe` — Дубай/Черногория, по умолчанию; `yookassa` — Россия).
 * Оба реализуют общий интерфейс `PaymentProvider`.
 *
 * Включается флагом `PAYMENTS_ENABLED`. Пока выключено — эндпоинты оплаты
 * отвечают 503, а фронт оформляет заказ по старой схеме («специалист свяжется»).
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('PaymentsService');
  private readonly providers: Record<string, PaymentProvider>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly yookassa: YookassaProvider,
    private readonly stripe: StripeProvider,
    private readonly notifications: NotificationsService,
  ) {
    this.providers = { yookassa: this.yookassa, stripe: this.stripe };
  }

  get enabled(): boolean {
    const v = this.config.get<string>('PAYMENTS_ENABLED');
    return v === 'true' || v === '1';
  }

  get providerName(): string {
    const name = (this.config.get<string>('PAYMENTS_PROVIDER') || 'stripe').toLowerCase();
    return this.providers[name] ? name : 'stripe';
  }

  get currency(): string {
    return this.config.get<string>('STORE_CURRENCY') || 'AED';
  }

  private get activeProvider(): PaymentProvider {
    return this.providers[this.providerName];
  }

  private get frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL')?.split(',')[0] ?? 'http://localhost:5173';
  }

  private orderNo(id: string): string {
    return id.slice(-6).toUpperCase();
  }

  /** Инициировать оплату заказа: создаёт платёж и возвращает ссылку на оплату. */
  async createForOrder(userId: string, orderId: string) {
    if (!this.enabled) {
      throw new ServiceUnavailableException('Онлайн-оплата временно недоступна');
    }
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Заказ не найден');
    if (order.userId && order.userId !== userId) {
      throw new ForbiddenException('Это не ваш заказ');
    }
    if (order.status === 'PAID') {
      throw new BadRequestException('Заказ уже оплачен');
    }

    const provider = this.activeProvider;
    const returnUrl = `${this.frontendUrl}/?screen=payment-result&order=${order.id}`;
    const result = await provider.createPayment({
      orderId: order.id,
      amount: order.total,
      currency: order.currency,
      description: `Заказ №${this.orderNo(order.id)} — Мозаика Здоровья`,
      returnUrl,
      cancelUrl: `${returnUrl}&canceled=1`,
      receipt: this.buildReceipt(order), // важно для ЮKassa (54-ФЗ); Stripe игнорирует
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: provider.name,
        paymentId: result.paymentId,
        status: 'PENDING_PAYMENT',
      },
    });

    return { confirmationUrl: result.confirmationUrl, paymentId: result.paymentId, orderId: order.id };
  }

  /** Инициировать оплату доступа к персональным «Домашним заданиям». */
  async createHomeworkPayment(userId: string) {
    if (!this.enabled) {
      throw new ServiceUnavailableException('Онлайн-оплата временно недоступна');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Цена доступа к индивидуальной программе (по умолчанию 1500 руб или из конфига)
    const price = Number(this.config.get<string>('HOMEWORK_PRICE') ?? 1500);

    const order = await this.prisma.order.create({
      data: {
        userId,
        type: 'HOMEWORK_SUBSCRIPTION',
        recipientName: user.name || user.email,
        phone: user.phone || '',
        address: 'Цифровой доступ к программе',
        total: price,
        currency: 'RUB',
        status: 'PENDING_PAYMENT',
      },
    });

    const provider = this.activeProvider;
    const returnUrl = `${this.frontendUrl}/?screen=payment-result&order=${order.id}`;
    const result = await provider.createPayment({
      orderId: order.id,
      amount: order.total,
      currency: order.currency,
      description: `Доступ к персональной программе — Мозаика Здоровья`,
      returnUrl,
      cancelUrl: `${returnUrl}&canceled=1`,
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: provider.name,
        paymentId: result.paymentId,
      },
    });

    return { confirmationUrl: result.confirmationUrl, paymentId: result.paymentId, orderId: order.id };
  }

  /**
   * Чек для 54-ФЗ (ЮKassa). По умолчанию выключен (`YOOKASSA_SEND_RECEIPT` != true),
   * т.к. требует корректной ставки НДС и настроенной фискализации в кабинете.
   */
  private buildReceipt(order: {
    phone: string;
    currency: string;
    items: { name: string; price: number; quantity: number }[];
  }): ReceiptData | undefined {
    if (this.config.get<string>('YOOKASSA_SEND_RECEIPT') !== 'true') return undefined;
    // Фискальный чек 54-ФЗ — только для рублёвых заказов (ЮKassa принимает чек только в RUB).
    if (order.currency !== 'RUB') return undefined;
    const vatCode = Number(this.config.get<string>('YOOKASSA_VAT_CODE') ?? 1);
    const phone = order.phone?.replace(/[^\d+]/g, '') || undefined;
    return {
      customer: phone ? { phone } : undefined,
      items: order.items.map((i) => ({
        description: i.name.slice(0, 128),
        quantity: String(i.quantity),
        amount: { value: i.price.toFixed(2), currency: order.currency },
        vat_code: vatCode,
        payment_mode: 'full_payment',
        payment_subject: 'commodity',
      })),
    };
  }

  /**
   * Обработка уведомления провайдера. Телу не доверяем — перепроверяем статус
   * платежа запросом к API провайдера. Идемпотентно: повторное событие не создаёт
   * дублей. Всегда отвечаем 200, чтобы провайдер не слал бесконечные повторы.
   */
  async handleWebhook(providerName: string, body: any) {
    const provider = this.providers[providerName];
    if (!provider) return { ok: true };

    const paymentId = provider.extractWebhookPaymentId(body);
    if (!paymentId) return { ok: true };

    let status;
    try {
      status = await provider.getPaymentStatus(paymentId);
    } catch (e) {
      this.logger.warn(`Не удалось проверить платёж ${paymentId} (${providerName}): ${e}`);
      return { ok: true };
    }

    let order = await this.prisma.order.findFirst({ where: { paymentId } });
    if (!order && status.orderId) {
      order = await this.prisma.order.findUnique({ where: { id: status.orderId } });
    }
    if (!order) return { ok: true };

    if (status.paid && order.status !== 'PAID') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paidAt: new Date() },
      });

      if (order.type === 'HOMEWORK_SUBSCRIPTION' && order.userId) {
        // Доступ предоставляется на 1 год (365 дней)
        const paidUntil = new Date();
        paidUntil.setFullYear(paidUntil.getFullYear() + 1);

        await this.prisma.user.update({
          where: { id: order.userId },
          data: { homeworkPaidUntil: paidUntil },
        });
      }

      if (order.userId) {
        await this.notifications.notify(order.userId, {
          type: 'order_paid',
          title_ru: 'Оплата получена',
          title_en: 'Payment received',
          body_ru: order.type === 'HOMEWORK_SUBSCRIPTION'
            ? 'Доступ к персональной программе успешно оплачен!'
            : `Заказ №${this.orderNo(order.id)} оплачен. Мы свяжемся для подтверждения доставки.`,
          body_en: order.type === 'HOMEWORK_SUBSCRIPTION'
            ? 'Access to personal program successfully paid!'
            : `Order #${this.orderNo(order.id)} is paid. We will contact you to confirm delivery.`,
          data: { orderId: order.id, screen: order.type === 'HOMEWORK_SUBSCRIPTION' ? 'home' : 'profile' },
        });
      }
      this.logger.log(`Заказ ${order.id} оплачен (${providerName}, платёж ${paymentId})`);
    } else if (status.status === 'canceled' && order.status === 'PENDING_PAYMENT') {
      await this.prisma.order.update({ where: { id: order.id }, data: { status: 'NEW' } });
    }

    return { ok: true };
  }
}
