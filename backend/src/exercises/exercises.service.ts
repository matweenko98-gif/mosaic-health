import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  // Общий каталог (доступен всем вошедшим)
  findCatalog(category?: string) {
    return this.prisma.exercise.findMany({
      where: { isIndividual: false, ...(category ? { category } : {}) },
      orderBy: { id: 'asc' },
    });
  }

  // Упражнения для индивидуальных программ (для конструктора врача)
  findIndividual(category?: string) {
    return this.prisma.exercise.findMany({
      where: { isIndividual: true, ...(category ? { category } : {}) },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exercise) throw new NotFoundException('Упражнение не найдено');
    return exercise;
  }
}
