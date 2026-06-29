import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Отправка писем. На этапе разработки реальная почта не подключена —
 * ссылки выводятся в лог сервера. Позже сюда добавится SMTP-провайдер.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');

  constructor(private readonly config: ConfigService) {}

  private get frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL')?.split(',')[0] ?? 'http://localhost:5173';
  }

  async sendVerifyEmail(email: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/verify-email?token=${token}`;
    this.logger.log(`[Подтверждение email] для ${email}: ${link}`);
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/reset-password?token=${token}`;
    this.logger.log(`[Сброс пароля] для ${email}: ${link}`);
  }
}
