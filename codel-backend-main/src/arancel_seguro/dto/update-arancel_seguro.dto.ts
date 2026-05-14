import { PartialType } from '@nestjs/mapped-types';
import { CreateArancelSeguroDto } from './create-arancel_seguro.dto';

export class UpdateArancelSeguroDto extends PartialType(CreateArancelSeguroDto) { }
