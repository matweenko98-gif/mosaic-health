import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribePushDto } from './dto/notifications.dto';

/** Полезная нагрузка уведомления — двуязычная (RU/EN), как и весь контент. */
export interface NotifyPayload {
  type?: string;
  title_ru: string;
  title_en?: string;
  body_ru?: string;
  body_en?: string;
  data?: Record<string, any>;
}

/**
 * Уведомления пользователю: лента «колокольчика» в приложении + web-push (PWA).
 * Push отправляется, только если заданы VAPID-ключи; иначе остаётся лента в приложении.
 */
@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger('NotificationsService');
  private pushReady = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.config.get<string>('VAPID_SUBJECT') || 'mailto:admin@mosaic.health';
    if (publicKey && privateKey) {
      try {
        webpush.setVapidDetails(subject, publicKey, privateKey);
        this.pushReady = true;
        this.logger.log('Web-push настроен (VAPID-ключи заданы)');
      } catch (e) {
        this.logger.warn(`Не удалось настроить web-push: ${e}`);
      }
    } else {
      this.logger.log('Web-push выключен (нет VAPID-ключей) — уведомления только в приложении');
    }
  }

  /** Публичный VAPID-ключ для подписки браузера (или null, если push выключен). */
  get vapidPublicKey(): string | null {
    return this.config.get<string>('VAPID_PUBLIC_KEY') ?? null;
  }

  // ---------- Подписки на push ----------
  subscribe(userId: string, dto: SubscribePushDto) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: { userId, endpoint: dto.endpoint, p256dh: dto.keys.p256dh, auth: dto.keys.auth },
      update: { userId, p256dh: dto.keys.p256dh, auth: dto.keys.auth },
    });
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
    return { ok: true };
  }

  // ---------- Лента «колокольчика» ----------
  listForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  // ---------- Создать уведомление + отправить push ----------
  async notify(userId: string, payload: NotifyPayload) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: payload.type ?? 'info',
        title_ru: payload.title_ru,
        title_en: payload.title_en ?? '',
        body_ru: payload.body_ru ?? '',
        body_en: payload.body_en ?? '',
        data: payload.data ?? undefined,
      },
    });
    // Push — «лучшими усилиями»: сбой доставки не должен ломать основную операцию.
    await this.sendPush(userId, payload).catch((e) =>
      this.logger.warn(`Ошибка отправки push: ${e}`),
    );
    return notification;
  }

  private async sendPush(userId: string, payload: NotifyPayload) {
    if (!this.pushReady) return;
    const subs = await this.prisma.pushSubscription.findMany({ where: { userId } });
    if (subs.length === 0) return;

    const body = JSON.stringify({
      title: payload.title_ru,
      title_en: payload.title_en ?? '',
      body: payload.body_ru ?? '',
      body_en: payload.body_en ?? '',
      data: payload.data ?? {},
    });

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            body,
          );
        } catch (err: any) {
          const status = err?.statusCode;
          // 404/410 — подписка устарела (устройство отписалось): удаляем.
          if (status === 404 || status === 410) {
            await this.prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          } else {
            this.logger.warn(`Push не доставлен (${status ?? '?'}): ${err?.message ?? err}`);
          }
        }
      }),
    );
  }
}
