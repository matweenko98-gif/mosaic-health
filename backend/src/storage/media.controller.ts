import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { MediaService } from './media.service';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { SignQueryDto, UploadUrlDto } from './dto/media.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  // Временная ссылка на просмотр/скачивание файла
  @Get('sign')
  async sign(@CurrentUser() user: AuthUser, @Query() q: SignQueryDto) {
    const url = await this.media.getDownloadUrl(user, q.kind ?? 'media', q.key);
    return { url };
  }

  // Ссылка для загрузки медиафайла — только врач/админ
  @Post('upload-url')
  @Roles(Role.SPECIALIST, Role.ADMIN)
  async uploadUrl(@Body() dto: UploadUrlDto) {
    return this.media.getMediaUploadUrl(dto.folder ?? 'misc', dto.contentType, dto.ext);
  }
}
