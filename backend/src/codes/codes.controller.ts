import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CodesService } from './codes.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { ActivateCodeDto, CreateCodeDto } from './dto/codes.dto';

/**
 * Коды доступа врача: список, создание, удаление.
 */
@Controller('specialist/codes')
@Roles(Role.SPECIALIST, Role.ADMIN)
export class SpecialistCodesController {
  constructor(private readonly codes: CodesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.codes.listForSpecialist(user);
  }

  @Post()
  create(@CurrentUser('id') specialistId: string, @Body() dto: CreateCodeDto) {
    return this.codes.createForSpecialist(specialistId, dto.label);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.codes.deleteCode(user, id);
  }
}

/**
 * Активация кода пациентом и проверка доступа.
 */
@Controller('me')
export class PatientCodesController {
  constructor(private readonly codes: CodesService) {}

  @Get('access')
  access(@CurrentUser('id') userId: string) {
    return this.codes.hasAccess(userId);
  }

  @Post('activate-code')
  activate(@CurrentUser('id') userId: string, @Body() dto: ActivateCodeDto) {
    return this.codes.activate(userId, dto.code);
  }
}
