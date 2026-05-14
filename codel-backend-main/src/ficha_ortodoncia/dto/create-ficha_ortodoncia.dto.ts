import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateFichaOrtodonciaDto {
    @IsNotEmpty()
    @IsNumber()
    pacienteId: number;

    @IsNotEmpty()
    @IsNumber()
    proformaId: number;

    @IsOptional()
    @IsString()
    diagnostico?: string;

    @IsOptional()
    @IsBoolean()
    ortodoncia_superior?: boolean;

    @IsOptional()
    @IsBoolean()
    ortodoncia_inferior?: boolean;

    @IsOptional()
    @IsBoolean()
    ortodoncia_bimaxilar?: boolean;

    @IsOptional()
    @IsBoolean()
    ortopedia?: boolean;

    @IsOptional()
    @IsBoolean()
    ap_ortodontico_ortopedico?: boolean;

    @IsOptional()
    @IsString()
    ap_descripcion?: string;

    @IsOptional()
    @IsBoolean()
    bandas_superior?: boolean;

    @IsOptional()
    @IsBoolean()
    bandas_inferior?: boolean;

    @IsOptional()
    @IsBoolean()
    bandas_ambos?: boolean;

    @IsOptional()
    @IsBoolean()
    tubos_superior?: boolean;

    @IsOptional()
    @IsBoolean()
    tubos_inferior?: boolean;

    @IsOptional()
    @IsBoolean()
    tubos_ambos?: boolean;

    @IsOptional()
    @IsBoolean()
    brackets_conv_metalicos?: boolean;

    @IsOptional()
    @IsBoolean()
    brackets_conv_esteticos?: boolean;

    @IsOptional()
    @IsBoolean()
    brackets_conv_combinados?: boolean;

    @IsOptional()
    @IsBoolean()
    brackets_auto_metalicos?: boolean;

    @IsOptional()
    @IsBoolean()
    brackets_auto_esteticos?: boolean;

    @IsOptional()
    @IsBoolean()
    brackets_auto_combinados?: boolean;

    @IsOptional()
    @IsBoolean()
    alineadores_metalicos?: boolean;

    @IsOptional()
    @IsBoolean()
    alineadores_esteticos?: boolean;

    @IsOptional()
    @IsBoolean()
    alineadores_combinados?: boolean;

    @IsOptional()
    @IsBoolean()
    atp?: boolean;

    @IsOptional()
    @IsBoolean()
    arco_lingual?: boolean;

    @IsOptional()
    @IsBoolean()
    mascara_traccion_frontal?: boolean;

    @IsOptional()
    @IsBoolean()
    disyuntor_palatino_hirax?: boolean;

    @IsOptional()
    @IsBoolean()
    componentes_otros?: boolean;

    @IsOptional()
    @IsString()
    componentes_otros_texto?: string;

    @IsOptional()
    @IsBoolean()
    identificador_levantamiento_mordida?: boolean;

    @IsOptional()
    @IsString()
    levantamiento_tipo?: string;

    @IsOptional()
    @IsBoolean()
    exodoncia_ortodoncia?: boolean;

    @IsOptional()
    @IsString()
    exodoncia_piezas?: string;

    @IsOptional()
    @IsString()
    tiempo_aproximado?: string;

    @IsOptional()
    @IsString()
    otros?: string;

    @IsOptional()
    @IsString()
    observaciones?: string;
}
