import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailTokenType, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';

export interface TokenBundle {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  // ---- Публичное представление пользователя (без пароля) ----
  publicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      age: user.age,
      country: user.country,
      hasRehabilitation: user.hasRehabilitation,
      avatarKey: user.avatarKey,
      emailVerified: !!user.emailVerifiedAt,
    };
  }

  // ---- Генерация пары токенов ----
  private async issueTokens(user: Pick<User, 'id' | 'email' | 'role'>): Promise<TokenBundle> {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_TTL') ?? '15m',
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_TTL') ?? '30d',
      },
    );
    return { accessToken, refreshToken };
  }

  // ---- Регистрация ----
  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    let accessCodeRecord: any = null;
    if (dto.code) {
      const code = dto.code.trim().toUpperCase();
      accessCodeRecord = await this.prisma.accessCode.findUnique({ where: { code } });
      if (!accessCodeRecord) {
        throw new BadRequestException('Код не найден. Проверьте правильность.');
      }
      if (accessCodeRecord.isRevoked) {
        throw new ConflictException('Этот код был отозван и больше недействителен');
      }
      if (accessCodeRecord.activatedById) {
        throw new ConflictException('Этот код уже использован на другом аккаунте');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: dto.name ?? '',
        phone: dto.phone ?? '',
        age: dto.age ?? '',
        country: dto.country ?? '',
        hasRehabilitation: dto.hasRehabilitation ?? false,
        settings: { create: {} },
      },
    });

    if (accessCodeRecord) {
      await this.prisma.accessCode.update({
        where: { id: accessCodeRecord.id },
        data: { activatedById: user.id, activatedAt: new Date() },
      });
    }

    await this.createAndSendEmailToken(user, EmailTokenType.VERIFY);
    const tokens = await this.issueTokens(user);
    return { user: this.publicUser(user), ...tokens };
  }

  // ---- Вход ----
  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    const tokens = await this.issueTokens(user);
    return { user: this.publicUser(user), ...tokens };
  }

  // ---- Обновление сессии по refresh-токену ----
  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException('Нет сессии');
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Сессия истекла, войдите снова');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Пользователь не найден');
    const tokens = await this.issueTokens(user);
    return { user: this.publicUser(user), ...tokens };
  }

  // ---- Текущий пользователь ----
  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Пользователь не найден');
    return this.publicUser(user);
  }

  // ---- Подтверждение email ----
  async verifyEmail(token: string) {
    const record = await this.consumeToken(token, EmailTokenType.VERIFY);
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    });
    return { ok: true };
  }

  // ---- Запрос на сброс пароля ----
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Не раскрываем, существует ли email — всегда отвечаем успехом.
    if (user) {
      await this.createAndSendEmailToken(user, EmailTokenType.RESET);
    }
    return { ok: true };
  }

  // ---- Сброс пароля ----
  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.consumeToken(dto.token, EmailTokenType.RESET);
    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    return { ok: true };
  }

  // ---- Вспомогательные ----
  private async createAndSendEmailToken(user: User, type: EmailTokenType) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа
    await this.prisma.emailToken.create({
      data: { userId: user.id, type, token, expiresAt },
    });
    if (type === EmailTokenType.VERIFY) {
      await this.mail.sendVerifyEmail(user.email, token);
    } else {
      await this.mail.sendPasswordReset(user.email, token);
    }
  }

  private async consumeToken(token: string, type: EmailTokenType) {
    const record = await this.prisma.emailToken.findUnique({ where: { token } });
    if (!record || record.type !== type || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Ссылка недействительна или истекла');
    }
    await this.prisma.emailToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    return record;
  }
}
