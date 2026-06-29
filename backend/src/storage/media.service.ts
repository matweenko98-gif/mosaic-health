import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { BucketKind, StorageService } from './storage.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly storage: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Проверяет, можно ли пользователю получить файл по ключу.
   * Индивидуальные видео доступны только назначенному пациенту (или врачу/админу).
   * Остальной контент (общие тренировки, онбординг, подкасты, аватары) — любому вошедшему.
   */
  private async assertCanAccess(user: AuthUser, kind: BucketKind, key: string) {
    if (kind === 'avatars') return;

    const exercise = await this.prisma.exercise.findFirst({ where: { videoKey: key } });
    if (!exercise || !exercise.isIndividual) return;

    if (user.role === Role.SPECIALIST || user.role === Role.ADMIN) return;

    const assigned = await this.prisma.programItem.findFirst({
      where: { exerciseId: exercise.id, program: { patientId: user.id } },
    });
    if (!assigned) {
      throw new ForbiddenException('Это видео доступно только по назначению специалиста');
    }
  }

  async getDownloadUrl(user: AuthUser, kind: BucketKind, key: string): Promise<string> {
    await this.assertCanAccess(user, kind, key);
    return this.storage.getDownloadUrl(kind, key);
  }

  /**
   * Ссылка для загрузки медиа (видео/аудио/картинки товаров) — только врач/админ.
   * Возвращает сгенерированный ключ файла и временную ссылку для прямой загрузки в хранилище.
   */
  async getMediaUploadUrl(folder: string, contentType: string, ext: string) {
    const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '') || 'misc';
    const key = `${safeFolder}/${Date.now()}-${randomBytes(6).toString('hex')}.${ext.replace(/[^a-z0-9]/gi, '') || 'bin'}`;
    const url = await this.storage.getUploadUrl('media', key, contentType);
    return { key, url };
  }

  async getAvatarUploadUrl(userId: string, contentType: string, ext: string) {
    const key = `avatar/${userId}/${Date.now()}.${ext.replace(/[^a-z0-9]/gi, '') || 'jpg'}`;
    const url = await this.storage.getUploadUrl('avatars', key, contentType);
    return { key, url };
  }
}
