import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateArticleDto {
  @IsString() title_ru: string;
  @IsOptional() @IsString() title_en?: string;
  @IsOptional() @IsString() description_ru?: string;
  @IsOptional() @IsString() description_en?: string;
  @IsOptional() @IsString() body_ru?: string;
  @IsOptional() @IsString() body_en?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() readTime?: string;
}

export class UpdateArticleDto {
  @IsOptional() @IsString() title_ru?: string;
  @IsOptional() @IsString() title_en?: string;
  @IsOptional() @IsString() description_ru?: string;
  @IsOptional() @IsString() description_en?: string;
  @IsOptional() @IsString() body_ru?: string;
  @IsOptional() @IsString() body_en?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() readTime?: string;
}

export class CreateArticleCategoryDto {
  @IsString() name_ru: string;
  @IsOptional() @IsString() name_en?: string;
}

export class UpdateArticleCategoryDto {
  @IsOptional() @IsString() name_ru?: string;
  @IsOptional() @IsString() name_en?: string;
}

export class UpdateExpertLinksDto {
  @IsOptional() @IsString() aroma_ru?: string;
  @IsOptional() @IsString() aroma_en?: string;
  @IsOptional() @IsString() omega_ru?: string;
  @IsOptional() @IsString() omega_en?: string;
  @IsOptional() @IsString() max_aroma_ru?: string;
  @IsOptional() @IsString() max_omega_ru?: string;
}

export class CreatePodcastDto {
  @IsString() title_ru: string;
  @IsOptional() @IsString() title_en?: string;
  @IsOptional() @IsString() description_ru?: string;
  @IsOptional() @IsString() description_en?: string;
  @IsOptional() @IsInt() @Min(0) durationMin?: number;
  @IsOptional() @IsString() audioKey?: string;
}

export class UpdatePodcastDto {
  @IsOptional() @IsString() title_ru?: string;
  @IsOptional() @IsString() title_en?: string;
  @IsOptional() @IsString() description_ru?: string;
  @IsOptional() @IsString() description_en?: string;
  @IsOptional() @IsInt() @Min(0) durationMin?: number;
  @IsOptional() @IsString() audioKey?: string;
}
