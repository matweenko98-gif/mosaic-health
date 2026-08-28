import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService — единая точка доступа к базе данных.
 * Открывает соединение при старте приложения и закрывает при остановке.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        break;
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
        // eslint-disable-next-line no-console
        console.warn(`[PrismaService] Подключение к БД не удалось, повтор через 2с... (${err.message})`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
