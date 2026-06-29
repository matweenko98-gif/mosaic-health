import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExercisesModule } from './exercises/exercises.module';
import { HistoryModule } from './history/history.module';
import { ProgramsModule } from './programs/programs.module';
import { ContentModule } from './content/content.module';
import { ShopModule } from './shop/shop.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { AppController } from './app.controller';

/**
 * Корневой модуль приложения.
 * Глобально включены: проверка токена входа (JwtAuthGuard) и проверка ролей (RolesGuard).
 * Доменные модули добавляются по мере разработки.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    StorageModule,
    AuthModule,
    UsersModule,
    ExercisesModule,
    HistoryModule,
    ProgramsModule,
    ContentModule,
    ShopModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
