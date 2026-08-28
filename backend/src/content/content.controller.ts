import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ContentService } from './content.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Чтение материалов от создателя — доступно любому пользователю.
 */
@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Public()
  @Get('articles')
  articles() {
    return this.content.listArticles();
  }

  @Public()
  @Get('article-categories')
  articleCategories() {
    return this.content.listArticleCategories();
  }

  @Public()
  @Get('settings/expert-links')
  expertLinks() {
    return this.content.getExpertLinks();
  }

  @Public()
  @Get('articles/:id')
  article(@Param('id', ParseIntPipe) id: number) {
    return this.content.getArticle(id);
  }

  @Public()
  @Get('podcasts')
  podcasts() {
    return this.content.listPodcasts();
  }

  @Public()
  @Get('podcasts/:id')
  podcast(@Param('id', ParseIntPipe) id: number) {
    return this.content.getPodcast(id);
  }
}
