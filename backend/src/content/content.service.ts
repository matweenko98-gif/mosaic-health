import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateArticleCategoryDto,
  CreateArticleDto,
  CreatePodcastDto,
  UpdateArticleCategoryDto,
  UpdateArticleDto,
  UpdateExpertLinksDto,
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

  // ---------- Категории статей ----------
  async listArticleCategories() {
    let categories = await this.prisma.articleCategory.findMany({ orderBy: { id: 'asc' } });
    if (categories.length === 0) {
      const defaults = [
        'Практическая кинезиология',
        'Ароматерапия',
        'Омега-3',
        'Наши помощники',
      ];
      for (const name_ru of defaults) {
        await this.prisma.articleCategory.upsert({
          where: { name_ru },
          create: { name_ru, name_en: '' },
          update: {},
        });
      }
      categories = await this.prisma.articleCategory.findMany({ orderBy: { id: 'asc' } });
    }
    return categories;
  }

  async createArticleCategory(dto: CreateArticleCategoryDto) {
    const exists = await this.prisma.articleCategory.findUnique({
      where: { name_ru: dto.name_ru.trim() },
    });
    if (exists) {
      throw new ConflictException('Категория с таким названием уже существует');
    }
    return this.prisma.articleCategory.create({
      data: {
        name_ru: dto.name_ru.trim(),
        name_en: dto.name_en ? dto.name_en.trim() : '',
      },
    });
  }

  async updateArticleCategory(id: number, dto: UpdateArticleCategoryDto) {
    const existing = await this.prisma.articleCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Категория не найдена');

    const newNameRu = dto.name_ru ? dto.name_ru.trim() : existing.name_ru;
    const newNameEn = dto.name_en !== undefined ? dto.name_en.trim() : existing.name_en;

    // Если переименовываем, обновляем все статьи в этой категории
    if (newNameRu !== existing.name_ru) {
      await this.prisma.article.updateMany({
        where: { category: existing.name_ru },
        data: { category: newNameRu },
      });
    }

    return this.prisma.articleCategory.update({
      where: { id },
      data: { name_ru: newNameRu, name_en: newNameEn },
    });
  }

  async deleteArticleCategory(id: number) {
    const existing = await this.prisma.articleCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Категория не найдена');

    // Статьи из удаляемой категории переносим в дефолтную «Практическая кинезиология»
    await this.prisma.article.updateMany({
      where: { category: existing.name_ru },
      data: { category: 'Практическая кинезиология' },
    });

    await this.prisma.articleCategory.delete({ where: { id } });
    return { ok: true };
  }

  // ---------- Ссылки эксперта (Настройки) ----------
  async getExpertLinks() {
    const keys = [
      'expert_link_aroma_ru',
      'expert_link_aroma_en',
      'expert_link_omega_ru',
      'expert_link_omega_en',
      'expert_link_max_aroma_ru',
      'expert_link_max_omega_ru',
    ];
    const settings = await this.prisma.systemSetting.findMany({
      where: { key: { in: keys } },
    });
    const map = new Map(settings.map((s) => [s.key, s.value]));

    return {
      aroma_ru: map.get('expert_link_aroma_ru') || 'https://t.me/AromaSpecialist',
      aroma_en: map.get('expert_link_aroma_en') || 'https://t.me/AromaSpecialist',
      omega_ru: map.get('expert_link_omega_ru') || 'https://t.me/OmegaSpecialist',
      omega_en: map.get('expert_link_omega_en') || 'https://t.me/OmegaSpecialist',
      max_aroma_ru: map.get('expert_link_max_aroma_ru') || 'https://max.ru/aroma_expert',
      max_omega_ru: map.get('expert_link_max_omega_ru') || 'https://max.ru/omega_expert',
    };
  }

  async updateExpertLinks(dto: UpdateExpertLinksDto) {
    const updates = [
      { key: 'expert_link_aroma_ru', value: dto.aroma_ru },
      { key: 'expert_link_aroma_en', value: dto.aroma_en },
      { key: 'expert_link_omega_ru', value: dto.omega_ru },
      { key: 'expert_link_omega_en', value: dto.omega_en },
      { key: 'expert_link_max_aroma_ru', value: dto.max_aroma_ru },
      { key: 'expert_link_max_omega_ru', value: dto.max_omega_ru },
    ];

    for (const item of updates) {
      if (item.value !== undefined) {
        await this.prisma.systemSetting.upsert({
          where: { key: item.key },
          create: { key: item.key, value: item.value.trim() },
          update: { value: item.value.trim() },
        });
      }
    }

    return this.getExpertLinks();
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
