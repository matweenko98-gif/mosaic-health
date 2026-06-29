import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateArticleDto,
  CreatePodcastDto,
  UpdateArticleDto,
  UpdatePodcastDto,
} from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Статьи ----------
  listArticles() {
    return this.prisma.article.findMany({ orderBy: { publishedAt: 'desc' } });
  }

  async getArticle(id: number) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Статья не найдена');
    return article;
  }

  createArticle(authorId: string, dto: CreateArticleDto) {
    return this.prisma.article.create({ data: { ...dto, authorId } });
  }

  async updateArticle(id: number, dto: UpdateArticleDto) {
    await this.getArticle(id);
    return this.prisma.article.update({ where: { id }, data: dto });
  }

  async deleteArticle(id: number) {
    await this.getArticle(id);
    await this.prisma.article.delete({ where: { id } });
    return { ok: true };
  }

  // ---------- Подкасты ----------
  listPodcasts() {
    return this.prisma.podcast.findMany({ orderBy: { publishedAt: 'desc' } });
  }

  async getPodcast(id: number) {
    const podcast = await this.prisma.podcast.findUnique({ where: { id } });
    if (!podcast) throw new NotFoundException('Подкаст не найден');
    return podcast;
  }

  createPodcast(dto: CreatePodcastDto) {
    return this.prisma.podcast.create({ data: dto });
  }

  async updatePodcast(id: number, dto: UpdatePodcastDto) {
    await this.getPodcast(id);
    return this.prisma.podcast.update({ where: { id }, data: dto });
  }

  async deletePodcast(id: number) {
    await this.getPodcast(id);
    await this.prisma.podcast.delete({ where: { id } });
    return { ok: true };
  }
}
