import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CodesService } from '../codes/codes.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateProgramDto, UpdateProgramDto, UpdateProgressDto } from './dto/programs.dto';

const programInclude = {
  items: { include: { exercise: true }, orderBy: { order: 'asc' as const } },
  progress: true,
  specialist: { select: { id: true, name: true } },
  patient: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ProgramInclude;

@Injectable()
export class ProgramsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly codes: CodesService,
  ) {}

  // ---------- Пациент ----------

  /**
   * Доступ к ДЗ для пациента = активный код от врача + оплаченная подписка.
   * Для врача/админа доступ всегда открыт. Проверяется на выдаче контента,
   * а не только в интерфейсе, чтобы платный контент нельзя было получить через API.
   */
  private async assertHomeworkAccess(user: AuthUser) {
    const { hasAccess } = await this.codes.hasAccess(user);
    if (!hasAccess) {
      throw new ForbiddenException(
        'Доступ к домашним заданиям закрыт: нужен код от врача и оплаченная подписка',
      );
    }
  }

  async listForPatient(user: AuthUser) {
    await this.assertHomeworkAccess(user);
    return this.prisma.program.findMany({
      where: { patientId: user.id },
      include: programInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForPatient(user: AuthUser, programId: string) {
    await this.assertHomeworkAccess(user);
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: programInclude,
    });
    if (!program || program.patientId !== user.id) {
      throw new NotFoundException('Программа не найдена');
    }
    return program;
  }

  async getProgress(user: AuthUser, programId: string) {
    await this.getForPatient(user, programId); // проверка доступа + принадлежности
    const progress = await this.prisma.programProgress.findUnique({ where: { programId } });
    return progress ?? { programId, currentIndex: -1, queue: [] };
  }

  async updateProgress(user: AuthUser, programId: string, dto: UpdateProgressDto) {
    await this.getForPatient(user, programId); // проверка доступа + принадлежности
    return this.prisma.programProgress.upsert({
      where: { programId },
      create: {
        programId,
        userId: user.id,
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
    const program = await this.prisma.program.create({
      data: {
        title: dto.title ?? 'Индивидуальная программа',
        patientId: dto.patientId,
        specialistId,
        items: { create: uniqueIds.map((exerciseId, order) => ({ exerciseId, order })) },
      },
      include: programInclude,
    });

    // Уведомляем пациента о новой индивидуальной программе.
    await this.notifications
      .notify(dto.patientId, {
        type: 'program_new',
        title_ru: 'Новая программа от специалиста',
        title_en: 'New program from your specialist',
        body_ru: `Вам назначена программа «${program.title}». Откройте раздел с домашними заданиями.`,
        body_en: `You have a new program "${program.title}". Open your homework section.`,
        data: { programId: program.id, screen: 'home' },
      })
      .catch(() => {});

    return program;
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
