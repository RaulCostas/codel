import { PartialType } from '@nestjs/mapped-types';
import { CreatePacienteSeguroDto } from './create-paciente-seguro.dto';

export class UpdatePacienteSeguroDto extends PartialType(CreatePacienteSeguroDto) {}
