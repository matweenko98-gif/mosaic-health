import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ExercisesService } from './exercises.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) {}

  // Общий каталог тренировок
  @Get()
  catalog(@Query('category') category?: string) {
    return this.exercises.findCatalog(category);
  }

  // Список индивидуальных упражнений — только для врача и админа (конструктор программ)
  @Get('individual')
  @Roles(Role.SPECIALIST, Role.ADMIN)
  individual(@Query('category') category?: string) {
    return this.exercises.findIndividual(category);
  }

  @Get(':id')
  one(@Param('id', ParseIntPipe) id: number) {
    return this.exercises.findOne(id);
  }
}
