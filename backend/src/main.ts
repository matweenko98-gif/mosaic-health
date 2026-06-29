import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Все маршруты под общим префиксом /api
  app.setGlobalPrefix('api');

  // Чтение cookie (для refresh-токена)
  app.use(cookieParser());

  // Автоматическая валидация входящих данных по DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Разрешаем фронтенду обращаться к API и передавать cookie
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Бэкенд «Мозаика Здоровья» запущен: http://localhost:${port}/api`);
}

bootstrap();
