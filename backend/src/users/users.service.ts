import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { MediaService } from '../storage/media.service';
import { UpdateProfileDto, UpdateSettingsDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly media: MediaService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return this.auth.publicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.age !== undefined ? { age: dto.age } : {}),
        ...(dto.country !== undefined ? { country: dto.country } : {}),
        ...(dto.hasRehabilitation !== undefined
          ? { hasRehabilitation: dto.hasRehabilitation }
          : {}),
      },
    });
    return this.auth.publicUser(user);
  }

  // Ссылка для загрузки нового аватара (файл грузится напрямую в хранилище)
  requestAvatarUpload(userId: string, contentType: string, ext: string) {
    return this.media.getAvatarUploadUrl(userId, contentType, ext);
  }

  // Сохранить ключ загруженного аватара в профиль
  async setAvatar(userId: string, key: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarKey: key },
    });
    return this.auth.publicUser(user);
  }

  async getSettings(userId: string) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    return {
      workoutReminders: settings.workoutReminders,
      articleNotifications: settings.articleNotifications,
      language: settings.language,
    };
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: { ...dto },
    });
    return {
      workoutReminders: settings.workoutReminders,
      articleNotifications: settings.articleNotifications,
      language: settings.language,
    };
  }
}
