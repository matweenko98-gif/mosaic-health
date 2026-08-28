import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { YookassaProvider } from './providers/yookassa.provider';
import { StripeProvider } from './providers/stripe.provider';

/**
 * Модуль оплаты. Провайдеры: Stripe (Дубай/Черногория) и ЮKassa (Россия) —
 * выбор через PAYMENTS_PROVIDER. Уведомления берутся из глобального
 * NotificationsModule. Включается флагом PAYMENTS_ENABLED.
 */
@Module({
  providers: [PaymentsService, YookassaProvider, StripeProvider],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
