import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() @MaxLength(3) age?: string;
  @IsOptional() @IsString() @MaxLength(80) country?: string;
  @IsOptional() @IsBoolean() hasRehabilitation?: boolean;
}

export class UpdateSettingsDto {
  @IsOptional() @IsBoolean() workoutReminders?: boolean;
  @IsOptional() @IsBoolean() articleNotifications?: boolean;
  @IsOptional() @IsString() @IsIn(['RU', 'EN']) language?: string;
}

export class AvatarUploadDto {
  @IsString() contentType: string;
  @IsString() ext: string;
}

export class SetAvatarDto {
  @IsString() key: string;
}
