import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { ExercisesAdminController } from './exercises-admin.controller';

@Module({
  controllers: [ExercisesController, ExercisesAdminController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule { }
