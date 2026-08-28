import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateContactBranchDto {
  @IsString()
  city_ru: string;

  @IsOptional()
  @IsString()
  city_en?: string;

  @IsOptional()
  @IsString()
  address_ru?: string;

  @IsOptional()
  @IsString()
  address_en?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  workHours_ru?: string;

  @IsOptional()
  @IsString()
  workHours_en?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateContactBranchDto {
  @IsOptional()
  @IsString()
  city_ru?: string;

  @IsOptional()
  @IsString()
  city_en?: string;

  @IsOptional()
  @IsString()
  address_ru?: string;

  @IsOptional()
  @IsString()
  address_en?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  workHours_ru?: string;

  @IsOptional()
  @IsString()
  workHours_en?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
