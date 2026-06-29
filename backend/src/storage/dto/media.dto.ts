import { IsIn, IsOptional, IsString } from 'class-validator';

export class UploadUrlDto {
  @IsString() contentType: string;
  @IsString() ext: string; // расширение файла, напр. "mp4", "mp3", "jpg"
  @IsOptional() @IsString() folder?: string; // папка в хранилище, напр. "exercise", "podcast", "product"
}

export class SignQueryDto {
  @IsString() key: string;
  @IsOptional() @IsIn(['media', 'avatars']) kind?: 'media' | 'avatars';
}
