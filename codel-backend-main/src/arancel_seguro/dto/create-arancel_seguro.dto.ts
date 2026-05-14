import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateArancelSeguroDto {
    @IsString()
    detalle: string;

    @IsNumber()
    @Min(0)
    precio: number;

    @IsString()
    @IsOptional()
    codigo?: string;

    @IsString()
    moneda: string;

    @IsString()
    @IsOptional()
    estado?: string;

    @IsNumber()
    @Min(1)
    idEspecialidad: number;

    @IsNumber()
    @Min(1)
    seguroId: number;
}
