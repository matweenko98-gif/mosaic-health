import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ExercisesService } from './exercises.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) { }

  // Общий каталог тренировок
  @Public()
  @Get()
  catalog(@Query('category') category?: string) {
    return this.exercises.findCatalog(category);
  }

  // Список индивидуальных упражнений — для пациентов, врачей и админов
  @Public()
  @Get('individual')
  individual(@Query('category') category?: string) {
    return this.exercises.findIndividual(category);
  }

  @Public()
  @Get(':id')
  one(@Param('id', ParseIntPipe) id: number) {
    return this.exercises.findOne(id);
  }
}
