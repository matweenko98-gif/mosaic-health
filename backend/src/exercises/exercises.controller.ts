import { Controller, ForbiddenException, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CodesService } from '../codes/codes.service';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('exercises')
export class ExercisesController {
  constructor(
    private readonly exercises: ExercisesService,
    private readonly codes: CodesService,
  ) {}

  // Доступ к индивидуальным (платным) упражнениям = код от врача + оплата.
  // Врач/админ — всегда. Проверяем на сервере, а не только в интерфейсе.
  private async assertHomeworkAccess(user: AuthUser) {
    const { hasAccess } = await this.codes.hasAccess(user);
    if (!hasAccess) {
      throw new ForbiddenException(
        'Доступ к домашним заданиям закрыт: нужен код от врача и оплаченная подписка',
      );
    }
  }

  // Общий каталог тренировок — открыт всем (бесплатный контент).
  @Public()
  @Get()
  catalog(@Query('category') category?: string) {
    return this.exercises.findCatalog(category);
  }

  // Индивидуальные упражнения (ДЗ) — только с открытым доступом.
  @Get('individual')
  async individual(@CurrentUser() user: AuthUser, @Query('category') category?: string) {
    await this.assertHomeworkAccess(user);
    return this.exercises.findIndividual(category);
  }

  // Одно упражнение: индивидуальное — только с доступом, общее — любому вошедшему.
  @Get(':id')
  async one(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    const exercise = await this.exercises.findOne(id);
    if (exercise.isIndividual) {
      await this.assertHomeworkAccess(user);
    }
    return exercise;
  }
}
