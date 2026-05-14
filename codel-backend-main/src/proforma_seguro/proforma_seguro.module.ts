import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProformaSeguroService } from './proforma_seguro.service';
import { ProformaSeguroController } from './proforma_seguro.controller';
import { ProformaSeguro } from './entities/proforma_seguro.entity';
import { HistoriaClinicaSeguro } from '../pacientes_seguro/entities/historia_clinica_seguro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProformaSeguro, HistoriaClinicaSeguro])],
  controllers: [ProformaSeguroController],
  providers: [ProformaSeguroService],
})
export class ProformaSeguroModule {}
