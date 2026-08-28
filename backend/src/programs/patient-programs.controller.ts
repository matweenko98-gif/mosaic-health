import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { UpdateProgressDto } from './dto/programs.dto';

/**
 * Программы глазами пациента: только назначенные ему и только при открытом доступе
 * (код от врача + оплаченная подписка) — проверка в сервисе.
 */
@Controller('me/programs')
export class PatientProgramsController {
  constructor(private readonly programs: ProgramsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.programs.listForPatient(user);
  }

  @Get(':id')
  one(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.programs.getForPatient(user, id);
  }

  @Get(':id/progress')
  getProgress(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.programs.getProgress(user, id);
  }

  @Patch(':id/progress')
  updateProgress(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.programs.updateProgress(user, id, dto);
  }
}
