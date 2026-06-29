import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ContentService } from './content.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateArticleDto,
  CreatePodcastDto,
  UpdateArticleDto,
  UpdatePodcastDto,
} from './dto/content.dto';

/**
 * Управление материалами — только для администратора.
 */
@Controller('admin')
@Roles(Role.ADMIN)
export class ContentAdminController {
  constructor(private readonly content: ContentService) {}

  @Post('articles')
  createArticle(@CurrentUser('id') authorId: string, @Body() dto: CreateArticleDto) {
    return this.content.createArticle(authorId, dto);
  }

  @Patch('articles/:id')
  updateArticle(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto) {
    return this.content.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  deleteArticle(@Param('id', ParseIntPipe) id: number) {
    return this.content.deleteArticle(id);
  }

  @Post('podcasts')
  createPodcast(@Body() dto: CreatePodcastDto) {
    return this.content.createPodcast(dto);
  }

  @Patch('podcasts/:id')
  updatePodcast(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePodcastDto) {
    return this.content.updatePodcast(id, dto);
  }

  @Delete('podcasts/:id')
  deletePodcast(@Param('id', ParseIntPipe) id: number) {
    return this.content.deletePodcast(id);
  }
}
