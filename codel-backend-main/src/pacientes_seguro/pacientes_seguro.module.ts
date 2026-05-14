import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesSeguroService } from './pacientes_seguro.service';
import { PacientesSeguroController } from './pacientes_seguro.controller';
import { PacienteSeguro } from './entities/paciente_seguro.entity';
import { FichaClinicaSeguro } from './entities/ficha_clinica_seguro.entity';
import { ExamenDentalSeguro } from './entities/examen_dental_seguro.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PacienteSeguro, FichaClinicaSeguro, ExamenDentalSeguro])],
    controllers: [PacientesSeguroController],
    providers: [PacientesSeguroService],
    exports: [PacientesSeguroService],
})
export class PacientesSeguroModule { }
