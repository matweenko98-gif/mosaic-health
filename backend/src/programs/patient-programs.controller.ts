import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProgressDto } from './dto/programs.dto';

/**
 * Программы глазами пациента: только назначенные ему.
 */
@Controller('me/programs')
export class PatientProgramsController {
  constructor(private readonly programs: ProgramsService) {}

  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.programs.listForPatient(userId);
  }

  @Get(':id')
  one(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.programs.getForPatient(userId, id);
  }

  @Get(':id/progress')
  getProgress(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.programs.getProgress(userId, id);
  }

  @Patch(':id/progress')
  updateProgress(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.programs.updateProgress(userId, id, dto);
  }
}
