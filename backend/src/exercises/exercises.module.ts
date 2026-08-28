import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { ExercisesAdminController } from './exercises-admin.controller';
import { CodesModule } from '../codes/codes.module';

@Module({
  imports: [CodesModule],
  controllers: [ExercisesController, ExercisesAdminController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule { }
