import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type BucketKind = 'media' | 'avatars';

/**
 * Доступ к объектному хранилищу (MinIO / S3).
 * Выдаёт временные ссылки на скачивание (GET) и загрузку (PUT) файлов.
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger('StorageService');
  private readonly s3: S3Client;
  private readonly ttl: number;
  // Хранилище файлов включается только если задан адрес (S3_ENDPOINT).
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.ttl = Number(this.config.get('SIGNED_URL_TTL') ?? 3600);
    this.enabled = !!this.config.get('S3_ENDPOINT');
    this.s3 = new S3Client({
      endpoint: this.config.get('S3_ENDPOINT'),
      region: this.config.get('S3_REGION') ?? 'us-east-1',
      credentials: {
        accessKeyId: this.config.get('S3_ACCESS_KEY')!,
        secretAccessKey: this.config.get('S3_SECRET_KEY')!,
      },
      forcePathStyle: String(this.config.get('S3_FORCE_PATH_STYLE')) === 'true',
    });
  }

  bucketName(kind: BucketKind): string {
    return kind === 'avatars'
      ? this.config.get('S3_BUCKET_AVATARS') ?? 'avatars'
      : this.config.get('S3_BUCKET_MEDIA') ?? 'media';
  }

  // При старте убеждаемся, что нужные «корзины» (бакеты) существуют.
  async onModuleInit() {
    if (!this.enabled) {
      this.logger.warn('Хранилище файлов не настроено (нет S3_ENDPOINT) — медиа отключено.');
      return;
    }
    for (const kind of ['media', 'avatars'] as BucketKind[]) {
      const Bucket = this.bucketName(kind);
      try {
        await this.s3.send(new HeadBucketCommand({ Bucket }));
      } catch {
        try {
          await this.s3.send(new CreateBucketCommand({ Bucket }));
          this.logger.log(`Создан бакет «${Bucket}»`);
        } catch (e) {
          this.logger.warn(`Не удалось создать бакет «${Bucket}»: ${(e as Error).message}`);
        }
      }
    }
  }

  private assertEnabled() {
    if (!this.enabled) {
      throw new ServiceUnavailableException('Хранилище файлов пока не настроено');
    }
  }

  async getDownloadUrl(kind: BucketKind, key: string): Promise<string> {
    this.assertEnabled();
    const command = new GetObjectCommand({ Bucket: this.bucketName(kind), Key: key });
    return getSignedUrl(this.s3, command, { expiresIn: this.ttl });
  }

  async getUploadUrl(
    kind: BucketKind,
    key: string,
    contentType: string,
  ): Promise<string> {
    this.assertEnabled();
    const command = new PutObjectCommand({
      Bucket: this.bucketName(kind),
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3, command, { expiresIn: this.ttl });
  }
}
