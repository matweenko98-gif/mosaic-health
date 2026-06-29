import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateWorkoutLogDto {
  @IsString() name: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsBoolean() isIndividual?: boolean;
  @IsOptional() @IsInt() @Min(0) completedCount?: number;
  @IsOptional() @IsInt() @Min(0) totalCount?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) exercises?: string[];
  @IsOptional() @IsInt() exerciseId?: number;
  @IsOptional() @IsString() programId?: string;
}
