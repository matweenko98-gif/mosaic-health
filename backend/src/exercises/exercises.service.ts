import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) { }

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

  async create(dto: any) {
    const durationMin = parseInt(dto.duration, 10) || 0;
    return this.prisma.exercise.create({
      data: {
        title_ru: dto.title_ru || dto.title || '',
        title_en: dto.title_en || '',
        description_ru: dto.description_ru || dto.description || '',
        description_en: dto.description_en || '',
        category: dto.category || 'Общее',
        isIndividual: !!dto.isIndividual,
        durationMin,
        videoKey: dto.videoKey || null,
      },
    });
  }

  async update(id: number, dto: any) {
    await this.findOne(id);
    const data: any = {};
    if (dto.title_ru !== undefined) data.title_ru = dto.title_ru;
    if (dto.title_en !== undefined) data.title_en = dto.title_en;
    if (dto.title !== undefined) data.title_ru = dto.title;
    if (dto.description_ru !== undefined) data.description_ru = dto.description_ru;
    if (dto.description_en !== undefined) data.description_en = dto.description_en;
    if (dto.description !== undefined) data.description_ru = dto.description;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.isIndividual !== undefined) data.isIndividual = !!dto.isIndividual;
    if (dto.videoKey !== undefined) data.videoKey = dto.videoKey;
    if (dto.duration !== undefined) {
      data.durationMin = parseInt(dto.duration, 10) || 0;
    }
    return this.prisma.exercise.update({ where: { id }, data });
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prisma.exercise.delete({ where: { id } });
    return { ok: true };
  }
}

