import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { PatientProgramsController } from './patient-programs.controller';
import { SpecialistController } from './specialist.controller';
import { CodesModule } from '../codes/codes.module';

@Module({
  imports: [CodesModule],
  controllers: [PatientProgramsController, SpecialistController],
  providers: [ProgramsService],
})
export class ProgramsModule {}
