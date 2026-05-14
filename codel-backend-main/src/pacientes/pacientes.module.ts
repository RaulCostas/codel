import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { Paciente } from './entities/paciente.entity';
import { Odontograma } from './entities/odontograma.entity';
import { FichaClinicaParticular } from './entities/ficha_clinica_particular.entity';
import { PacienteSeguro } from '../pacientes_seguro/entities/paciente_seguro.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Paciente, Odontograma, FichaClinicaParticular, PacienteSeguro])],
    controllers: [PacientesController],
    providers: [PacientesService],
    exports: [PacientesService],
})
export class PacientesModule { }
