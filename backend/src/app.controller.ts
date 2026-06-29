import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Public } from './auth/decorators/public.decorator';

/**
 * Базовый контроллер: проверка работоспособности сервиса и связи с базой.
 */
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('health')
  async health() {
    // Простой запрос, чтобы убедиться, что база отвечает.
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', service: 'mosaic-health-backend', db: 'up' };
  }
}
