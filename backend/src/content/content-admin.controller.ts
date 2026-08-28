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
  CreateArticleCategoryDto,
  CreateArticleDto,
  CreatePodcastDto,
  UpdateArticleCategoryDto,
  UpdateArticleDto,
  UpdateExpertLinksDto,
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

  @Post('article-categories')
  createCategory(@Body() dto: CreateArticleCategoryDto) {
    return this.content.createArticleCategory(dto);
  }

  @Patch('article-categories/:id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleCategoryDto,
  ) {
    return this.content.updateArticleCategory(id, dto);
  }

  @Delete('article-categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.content.deleteArticleCategory(id);
  }

  @Patch('settings/expert-links')
  updateExpertLinks(@Body() dto: UpdateExpertLinksDto) {
    return this.content.updateExpertLinks(dto);
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
