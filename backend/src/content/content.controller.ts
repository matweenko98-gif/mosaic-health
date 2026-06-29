import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ContentService } from './content.service';

/**
 * Чтение материалов от создателя — доступно любому вошедшему пользователю.
 */
@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('articles')
  articles() {
    return this.content.listArticles();
  }

  @Get('articles/:id')
  article(@Param('id', ParseIntPipe) id: number) {
    return this.content.getArticle(id);
  }

  @Get('podcasts')
  podcasts() {
    return this.content.listPodcasts();
  }

  @Get('podcasts/:id')
  podcast(@Param('id', ParseIntPipe) id: number) {
    return this.content.getPodcast(id);
  }
}
