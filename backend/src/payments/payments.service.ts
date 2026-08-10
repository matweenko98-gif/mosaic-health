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
import { ReceiptData } from './providers/payment-provider.interface';

/**
 * Оплата заказов. Провайдер сейчас один — ЮKassa (Россия); выбран через
 * абстракцию `PaymentProvider`, чтобы позже добавить международный без переделки.
 *
 * Включается флагом `PAYMENTS_ENABLED=true`. Пока выключено — эндпоинты оплаты
 * отвечают 503, а фронт оформляет заказ по старой схеме («специалист свяжется»).
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('PaymentsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly provider: YookassaProvider,
    private readonly notifications: NotificationsService,
  ) {}

  get enabled(): boolean {
    const v = this.config.get<string>('PAYMENTS_ENABLED');
    return v === 'true' || v === '1';
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

    const returnUrl = `${this.frontendUrl}/?screen=payment-result&order=${order.id}`;
    const result = await this.provider.createPayment({
      orderId: order.id,
      amount: order.total,
      currency: order.currency,
      description: `Заказ №${this.orderNo(order.id)} — Мозаика Здоровья`,
      returnUrl,
      receipt: this.buildReceipt(order),
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: this.provider.name,
        paymentId: result.paymentId,
        status: 'PENDING_PAYMENT',
      },
    });

    return { confirmationUrl: result.confirmationUrl, paymentId: result.paymentId, orderId: order.id };
  }

  /**
   * Чек для 54-ФЗ. По умолчанию выключен (`YOOKASSA_SEND_RECEIPT` != true),
   * т.к. требует корректной ставки НДС и настроенной фискализации в кабинете.
   * Включается заказчиком, когда касса настроена.
   */
  private buildReceipt(order: { phone: string; currency: string; items: { name: string; price: number; quantity: number }[] }): ReceiptData | undefined {
    if (this.config.get<string>('YOOKASSA_SEND_RECEIPT') !== 'true') return undefined;
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
   * Обработка уведомления ЮKassa. Телу не доверяем — перепроверяем статус
   * платежа запросом к API. Идемпотентно: повторное событие не создаёт дублей.
   * Всегда отвечаем 200, чтобы ЮKassa не слала бесконечные повторы.
   */
  async handleWebhook(body: any) {
    const paymentId: string | undefined = body?.object?.id;
    if (!paymentId) return { ok: true };

    let status;
    try {
      status = await this.provider.getPaymentStatus(paymentId);
    } catch (e) {
      this.logger.warn(`Не удалось проверить платёж ${paymentId}: ${e}`);
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
      if (order.userId) {
        await this.notifications.notify(order.userId, {
          type: 'order_paid',
          title_ru: 'Оплата получена',
          title_en: 'Payment received',
          body_ru: `Заказ №${this.orderNo(order.id)} оплачен. Мы свяжемся для подтверждения доставки.`,
          body_en: `Order #${this.orderNo(order.id)} is paid. We will contact you to confirm delivery.`,
          data: { orderId: order.id, screen: 'profile' },
        });
      }
      this.logger.log(`Заказ ${order.id} оплачен (платёж ${paymentId})`);
    } else if (status.status === 'canceled' && order.status === 'PENDING_PAYMENT') {
      // Оплата отменена/не завершена — возвращаем заказ в исходное состояние.
      await this.prisma.order.update({ where: { id: order.id }, data: { status: 'NEW' } });
    }

    return { ok: true };
  }
}
