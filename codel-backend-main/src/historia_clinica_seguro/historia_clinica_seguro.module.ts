import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriaClinicaSeguroService } from './historia_clinica_seguro.service';
import { HistoriaClinicaSeguroController } from './historia_clinica_seguro.controller';
import { HistoriaClinicaSeguro } from '../pacientes_seguro/entities/historia_clinica_seguro.entity';

@Module({
    imports: [TypeOrmModule.forFeature([HistoriaClinicaSeguro])],
    controllers: [HistoriaClinicaSeguroController],
    providers: [HistoriaClinicaSeguroService],
    exports: [HistoriaClinicaSeguroService],
})
export class HistoriaClinicaSeguroModule {}
