import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgramDto, UpdateProgramDto, UpdateProgressDto } from './dto/programs.dto';

const programInclude = {
  items: { include: { exercise: true }, orderBy: { order: 'asc' as const } },
  progress: true,
  specialist: { select: { id: true, name: true } },
  patient: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ProgramInclude;

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Пациент ----------

  listForPatient(patientId: string) {
    return this.prisma.program.findMany({
      where: { patientId },
      include: programInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForPatient(patientId: string, programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: programInclude,
    });
    if (!program || program.patientId !== patientId) {
      throw new NotFoundException('Программа не найдена');
    }
    return program;
  }

  async getProgress(patientId: string, programId: string) {
    await this.getForPatient(patientId, programId); // проверка доступа
    const progress = await this.prisma.programProgress.findUnique({ where: { programId } });
    return progress ?? { programId, currentIndex: -1, queue: [] };
  }

  async updateProgress(patientId: string, programId: string, dto: UpdateProgressDto) {
    await this.getForPatient(patientId, programId); // проверка доступа
    return this.prisma.programProgress.upsert({
      where: { programId },
      create: {
        programId,
        userId: patientId,
        currentIndex: dto.currentIndex,
        queue: dto.queue ?? [],
      },
      update: {
        currentIndex: dto.currentIndex,
        ...(dto.queue !== undefined ? { queue: dto.queue } : {}),
      },
    });
  }

  // ---------- Врач / Админ ----------

  listPatients() {
    return this.prisma.user.findMany({
      where: { role: Role.PATIENT },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProgram(specialistId: string, dto: CreateProgramDto) {
    const patient = await this.prisma.user.findUnique({ where: { id: dto.patientId } });
    if (!patient || patient.role !== Role.PATIENT) {
      throw new NotFoundException('Пациент не найден');
    }
    // Уникальность пары (программа, упражнение) — убираем дубликаты, сохраняя порядок.
    const uniqueIds = [...new Set(dto.exerciseIds)];
    return this.prisma.program.create({
      data: {
        title: dto.title ?? 'Индивидуальная программа',
        patientId: dto.patientId,
        specialistId,
        items: { create: uniqueIds.map((exerciseId, order) => ({ exerciseId, order })) },
      },
      include: programInclude,
    });
  }

  async getProgram(programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: programInclude,
    });
    if (!program) throw new NotFoundException('Программа не найдена');
    return program;
  }

  async updateProgram(user: { id: string; role: string }, programId: string, dto: UpdateProgramDto) {
    const program = await this.prisma.program.findUnique({ where: { id: programId } });
    if (!program) throw new NotFoundException('Программа не найдена');
    if (user.role === Role.SPECIALIST && program.specialistId !== user.id) {
      throw new ForbiddenException('Можно редактировать только свои программы');
    }

    if (dto.exerciseIds) {
      const uniqueIds = [...new Set(dto.exerciseIds)];
      // Полностью пересобираем список упражнений в заданном порядке.
      await this.prisma.programItem.deleteMany({ where: { programId } });
      await this.prisma.programItem.createMany({
        data: uniqueIds.map((exerciseId, order) => ({ programId, exerciseId, order })),
      });
    }
    if (dto.title !== undefined) {
      await this.prisma.program.update({ where: { id: programId }, data: { title: dto.title } });
    }
    return this.getProgram(programId);
  }

  async deleteProgram(user: { id: string; role: string }, programId: string) {
    const program = await this.prisma.program.findUnique({ where: { id: programId } });
    if (!program) throw new NotFoundException('Программа не найдена');
    if (user.role === Role.SPECIALIST && program.specialistId !== user.id) {
      throw new ForbiddenException('Можно удалять только свои программы');
    }
    await this.prisma.program.delete({ where: { id: programId } });
    return { ok: true };
  }
}
