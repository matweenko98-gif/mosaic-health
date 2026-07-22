import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateArticleDto {
  @IsString() title_ru: string;
  @IsOptional() @IsString() title_en?: string;
  @IsOptional() @IsString() description_ru?: string;
  @IsOptional() @IsString() description_en?: string;
  @IsOptional() @IsString() body_ru?: string;
  @IsOptional() @IsString() body_en?: string;
  @IsOptional() @IsString() readTime?: string;
}

export class UpdateArticleDto {
  @IsOptional() @IsString() title_ru?: string;
  @IsOptional() @IsString() title_en?: string;
  @IsOptional() @IsString() description_ru?: string;
  @IsOptional() @IsString() description_en?: string;
  @IsOptional() @IsString() body_ru?: string;
  @IsOptional() @IsString() body_en?: string;
  @IsOptional() @IsString() readTime?: string;
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
