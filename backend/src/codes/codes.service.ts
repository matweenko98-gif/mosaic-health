import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';

// Код состоит из 5 английских заглавных букв.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CODE_LENGTH = 5;

@Injectable()
export class CodesService {
  constructor(private readonly prisma: PrismaService) {}

  private randomCode(): string {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)];
    return code;
  }

  private async generateUniqueCode(): Promise<string> {
    // Практически исключаем коллизию, но на всякий случай проверяем.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = this.randomCode();
      const exists = await this.prisma.accessCode.findUnique({ where: { code } });
      if (!exists) return code;
    }
    throw new ConflictException('Не удалось сгенерировать код, попробуйте ещё раз');
  }

  // ---------- Врач / Админ ----------

  async listForSpecialist(user: AuthUser) {
    const where = user.role === Role.ADMIN ? {} : { specialistId: user.id };
    const codes = await this.prisma.accessCode.findMany({
      where,
      include: {
        activatedBy: {
          select: {
            name: true,
            email: true,
            createdAt: true,
            _count: {
              select: { workoutLogs: true },
            },
            workoutLogs: {
              select: { completedAt: true },
              orderBy: { completedAt: 'desc' },
              take: 1,
            },
          },
        },
        specialist: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return codes.map((c) => {
      let status = 'free';
      if (c.isRevoked) {
        status = 'revoked';
      } else if (c.activatedById) {
        status = 'activated';
      }

      return {
        id: c.id,
        code: c.code,
        label: c.label,
        status,
        activatedByName: c.activatedBy?.name || null,
        activatedByEmail: c.activatedBy?.email || null,
        activatedByRegisteredAt: c.activatedBy?.createdAt || null,
        activatedAt: c.activatedAt,
        createdAt: c.createdAt,
        isRevoked: c.isRevoked,
        workoutCount: c.activatedBy?._count?.workoutLogs ?? 0,
        lastWorkout: c.activatedBy?.workoutLogs?.[0]?.completedAt ?? null,
      };
    });
  }

  async createForSpecialist(specialistId: string, label?: string) {
    const code = await this.generateUniqueCode();
    const created = await this.prisma.accessCode.create({
      data: { code, label: label ?? '', specialistId },
    });
    return { id: created.id, code: created.code, label: created.label };
  }

  async deleteCode(user: AuthUser, id: string) {
    const code = await this.prisma.accessCode.findUnique({ where: { id } });
    if (!code) throw new NotFoundException('Код не найден');
    if (user.role === Role.SPECIALIST && code.specialistId !== user.id) {
      throw new ForbiddenException('Можно удалять только свои коды');
    }
    await this.prisma.accessCode.delete({ where: { id } });
    return { ok: true };
  }

  async revokeCode(user: AuthUser, id: string) {
    const code = await this.prisma.accessCode.findUnique({ where: { id } });
    if (!code) throw new NotFoundException('Код не найден');
    if (user.role === Role.SPECIALIST && code.specialistId !== user.id) {
      throw new ForbiddenException('Можно отзывать только свои коды');
    }
    await this.prisma.accessCode.update({
      where: { id },
      data: { isRevoked: true },
    });
    return { ok: true };
  }

  // ---------- Пациент ----------

  async hasAccess(user: AuthUser) {
    if (user.role === Role.ADMIN || user.role === Role.SPECIALIST) {
      return { hasAccess: true };
    }
    const count = await this.prisma.accessCode.count({
      where: { activatedById: user.id, isRevoked: false },
    });
    return { hasAccess: count > 0 };
  }

  async activate(userId: string, rawCode: string) {
    const code = rawCode.trim().toUpperCase();
    const record = await this.prisma.accessCode.findUnique({ where: { code } });
    if (!record) throw new NotFoundException('Код не найден. Проверьте правильность.');

    if (record.isRevoked) {
      throw new ConflictException('Этот код был отозван и больше недействителен');
    }

    if (record.activatedById) {
      // Уже активирован этим же пользователем — считаем успехом (идемпотентно).
      if (record.activatedById === userId) return { ok: true, alreadyYours: true };
      throw new ConflictException('Этот код уже использован на другом аккаунте');
    }

    await this.prisma.accessCode.update({
      where: { id: record.id },
      data: { activatedById: userId, activatedAt: new Date() },
    });
    return { ok: true };
  }
}
