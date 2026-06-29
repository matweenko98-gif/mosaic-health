import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProgramDto {
  @IsString() patientId: string;
  @IsOptional() @IsString() title?: string;
  @IsArray() @ArrayNotEmpty() @IsInt({ each: true }) exerciseIds: number[];
}

export class UpdateProgramDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsArray() @IsInt({ each: true }) exerciseIds?: number[];
}

export class UpdateProgressDto {
  @IsInt() @Min(-1) currentIndex: number;
  @IsOptional() @IsArray() queue?: any[];
}
