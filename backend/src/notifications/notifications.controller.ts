import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { SubscribePushDto, UnsubscribePushDto } from './dto/notifications.dto';

/**
 * Уведомления: лента «колокольчика» и управление подпиской на web-push.
 */
@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  /** Публичный VAPID-ключ — нужен браузеру, чтобы подписаться на push. */
  @Public()
  @Get('push/vapid-public-key')
  vapidKey() {
    return { key: this.notifications.vapidPublicKey };
  }

  @Post('me/push/subscribe')
  subscribe(@CurrentUser('id') userId: string, @Body() dto: SubscribePushDto) {
    return this.notifications.subscribe(userId, dto);
  }

  @Post('me/push/unsubscribe')
  unsubscribe(@CurrentUser('id') userId: string, @Body() dto: UnsubscribePushDto) {
    return this.notifications.unsubscribe(userId, dto.endpoint);
  }

  @Get('me/notifications')
  list(@CurrentUser('id') userId: string) {
    return this.notifications.listForUser(userId);
  }

  @Patch('me/notifications/read-all')
  readAll(@CurrentUser('id') userId: string) {
    return this.notifications.markAllRead(userId);
  }

  @Patch('me/notifications/:id/read')
  read(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notifications.markRead(userId, id);
  }
}
