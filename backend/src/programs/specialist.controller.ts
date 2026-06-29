import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ProgramsService } from './programs.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { CreateProgramDto, UpdateProgramDto } from './dto/programs.dto';

/**
 * Панель врача/админа: список пациентов и управление их программами.
 */
@Controller('specialist')
@Roles(Role.SPECIALIST, Role.ADMIN)
export class SpecialistController {
  constructor(private readonly programs: ProgramsService) {}

  @Get('patients')
  patients() {
    return this.programs.listPatients();
  }

  @Post('programs')
  create(@CurrentUser('id') specialistId: string, @Body() dto: CreateProgramDto) {
    return this.programs.createProgram(specialistId, dto);
  }

  @Get('programs/:id')
  one(@Param('id') id: string) {
    return this.programs.getProgram(id);
  }

  @Patch('programs/:id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProgramDto) {
    return this.programs.updateProgram(user, id, dto);
  }

  @Delete('programs/:id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.programs.deleteProgram(user, id);
  }
}
