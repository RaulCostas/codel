import { PartialType } from '@nestjs/mapped-types';
import { CreateFichaOrtodonciaDto } from './create-ficha_ortodoncia.dto';

export class UpdateFichaOrtodonciaDto extends PartialType(CreateFichaOrtodonciaDto) {}
