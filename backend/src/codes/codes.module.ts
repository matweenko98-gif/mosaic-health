import { Module } from '@nestjs/common';
import { CodesService } from './codes.service';
import { SpecialistCodesController, PatientCodesController } from './codes.controller';

@Module({
  controllers: [SpecialistCodesController, PatientCodesController],
  providers: [CodesService],
})
export class CodesModule {}
