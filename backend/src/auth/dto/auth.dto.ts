import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(72)
  password: string;

  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() age?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsBoolean() hasRehabilitation?: boolean;
}

export class LoginDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'Введите пароль' })
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(72)
  password: string;
}

export class VerifyEmailDto {
  @IsString()
  token: string;
}
