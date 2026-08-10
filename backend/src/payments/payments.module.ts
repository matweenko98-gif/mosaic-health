import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { YookassaProvider } from './providers/yookassa.provider';

/**
 * Модуль оплаты. Провайдер ЮKassa; уведомления берутся из глобального
 * NotificationsModule. Включается флагом PAYMENTS_ENABLED.
 */
@Module({
  providers: [PaymentsService, YookassaProvider],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
