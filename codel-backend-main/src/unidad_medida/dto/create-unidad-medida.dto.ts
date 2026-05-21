import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUnidadMedidaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    estado?: string;
}
