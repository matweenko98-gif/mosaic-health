import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCodeDto {
  @IsOptional() @IsString() @MaxLength(80) label?: string;
}

export class ActivateCodeDto {
  @IsString() @MinLength(3) @MaxLength(40) code: string;
}
