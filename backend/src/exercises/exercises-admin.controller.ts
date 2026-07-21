import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ExercisesService } from './exercises.service';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Управление упражнениями — только для администратора.
 */
@Controller('admin/exercises')
@Roles(Role.ADMIN)
export class ExercisesAdminController {
  constructor(private readonly exercises: ExercisesService) {}

  @Post()
  create(@Body() dto: any) {
    return this.exercises.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.exercises.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exercises.delete(id);
  }
}
