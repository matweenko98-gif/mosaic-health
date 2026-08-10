import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

/** Ключи подписки браузера на web-push (из PushSubscription.toJSON). */
export class PushKeysDto {
  @IsString() p256dh: string;
  @IsString() auth: string;
}

/** Подписка устройства на push-уведомления. */
export class SubscribePushDto {
  @IsString() endpoint: string;
  @ValidateNested()
  @Type(() => PushKeysDto)
  keys: PushKeysDto;
}

/** Отписка устройства (по endpoint). */
export class UnsubscribePushDto {
  @IsString() endpoint: string;
}
