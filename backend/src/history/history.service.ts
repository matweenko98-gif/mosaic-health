import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutLogDto } from './dto/history.dto';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });
  }

  create(userId: string, dto: CreateWorkoutLogDto) {
    return this.prisma.workoutLog.create({
      data: {
        userId,
        name: dto.name,
        status: dto.status ?? 'Выполнено',
        isIndividual: dto.isIndividual ?? false,
        completedCount: dto.completedCount ?? 0,
        totalCount: dto.totalCount ?? 0,
        exercises: dto.exercises ?? [],
        exerciseId: dto.exerciseId ?? null,
        programId: dto.programId ?? null,
      },
    });
  }

  // Достижение: количество дней подряд с тренировками
  async achievements(userId: string) {
    const logs = await this.prisma.workoutLog.findMany({
      where: { userId },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
    });

    const dayKey = (d: Date) =>
      `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const days = new Set(logs.map((l) => dayKey(l.completedAt)));

    let streak = 0;
    const cursor = new Date();
    // Если сегодня тренировки ещё не было, но была вчера — начинаем счёт со вчера.
    if (!days.has(dayKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
      if (!days.has(dayKey(cursor))) {
        return { daysInRow: 0 };
      }
    }
    while (days.has(dayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return { daysInRow: streak };
  }
}
