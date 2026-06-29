import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateArticleDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() readTime?: string;
}

export class UpdateArticleDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() readTime?: string;
}

export class CreatePodcastDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) durationMin?: number;
  @IsOptional() @IsString() audioKey?: string;
}

export class UpdatePodcastDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) durationMin?: number;
  @IsOptional() @IsString() audioKey?: string;
}
