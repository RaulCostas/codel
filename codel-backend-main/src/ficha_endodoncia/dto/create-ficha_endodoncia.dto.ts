import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFichaEndodonciaDto {
    @IsNotEmpty() @IsNumber() pacienteId: number;
    @IsNotEmpty() @IsNumber() proformaId: number;
    @IsOptional() @IsString() pieza_dental?: string;

    // 1. Diagnóstico Clínico
    @IsOptional() @IsBoolean() clinico_caries_dental?: boolean;
    @IsOptional() @IsBoolean() clinico_fractura_coronal?: boolean;
    @IsOptional() @IsBoolean() clinico_decoloracion_pieza?: boolean;
    @IsOptional() @IsBoolean() clinico_movilidad_dental?: boolean;
    @IsOptional() @IsBoolean() clinico_exposicion_pulpar?: boolean;
    @IsOptional() @IsBoolean() clinico_restauracion_deficiente?: boolean;
    @IsOptional() @IsBoolean() clinico_lesion_furca?: boolean;
    @IsOptional() @IsBoolean() clinico_recesion_gingival?: boolean;
    @IsOptional() @IsBoolean() clinico_atrision?: boolean;
    @IsOptional() @IsBoolean() clinico_abracion?: boolean;
    @IsOptional() @IsBoolean() clinico_abfraccion?: boolean;
    @IsOptional() @IsBoolean() clinico_alteracion_desarrollo?: boolean;

    // 2. Diagnóstico Radiográfico
    @IsOptional() @IsBoolean() radio_ligamento_ensanchado?: boolean;
    @IsOptional() @IsBoolean() radio_fractura_vertical?: boolean;
    @IsOptional() @IsBoolean() radio_fractura_horizontal?: boolean;
    @IsOptional() @IsBoolean() radio_apice_inmaduro?: boolean;
    @IsOptional() @IsBoolean() radio_caries_bajo_restauracion?: boolean;
    @IsOptional() @IsBoolean() radio_reabsorcion_externa?: boolean;
    @IsOptional() @IsBoolean() radio_reabsorcion_interna?: boolean;
    @IsOptional() @IsBoolean() radio_tcr_deficiente?: boolean;
    @IsOptional() @IsBoolean() radio_lesion_periapical?: boolean;
    @IsOptional() @IsBoolean() radio_lesion_lateral?: boolean;
    @IsOptional() @IsBoolean() radio_calcificacion_espacio?: boolean;
    @IsOptional() @IsBoolean() radio_perdida_osea?: boolean;

    // 3. Dolor (Antes y Ahora) - Presencia
    @IsOptional() @IsBoolean() dolor_pres_ninguno_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_pres_ninguno_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_pres_leve_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_pres_leve_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_pres_moderado_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_pres_moderado_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_pres_severo_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_pres_severo_ahora?: boolean;

    // 3. Dolor (Antes y Ahora) - Tipo
    @IsOptional() @IsBoolean() dolor_tipo_espontaneo_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_espontaneo_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_estimulado_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_estimulado_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_calor_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_calor_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_frio_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_frio_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_acidez_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_acidez_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_dulce_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_dulce_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_masticacion_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_masticacion_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_constante_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_constante_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_sordo_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_sordo_ahora?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_palpitante_antes?: boolean;
    @IsOptional() @IsBoolean() dolor_tipo_palpitante_ahora?: boolean;

    // 4. Diagnóstico Pulpar
    @IsOptional() @IsBoolean() pulpar_sana?: boolean;
    @IsOptional() @IsBoolean() pulpar_reversible?: boolean;
    @IsOptional() @IsBoolean() pulpar_irreversible_sintomatica?: boolean;
    @IsOptional() @IsBoolean() pulpar_irreversible_asintomatica?: boolean;
    @IsOptional() @IsBoolean() pulpar_necrosis?: boolean;
    @IsOptional() @IsBoolean() pulpar_previamente_tratada?: boolean;
    @IsOptional() @IsBoolean() pulpar_tcr_sin_terminar?: boolean;
    @IsOptional() @IsBoolean() pulpar_conducto_no_sellado?: boolean;

    // 5. Diagnóstico Periapical
    @IsOptional() @IsBoolean() peri_saludable?: boolean;
    @IsOptional() @IsBoolean() peri_apical_sintomatica?: boolean;
    @IsOptional() @IsBoolean() peri_apical_asintomatica?: boolean;
    @IsOptional() @IsBoolean() peri_absceso_agudo?: boolean;
    @IsOptional() @IsBoolean() peri_absceso_cronico?: boolean;
    @IsOptional() @IsBoolean() peri_osteitis_condensante?: boolean;

    // Secciones Adicionales
    @IsOptional() @IsString() observaciones?: string;
    @IsOptional() @IsString() diagnostico?: string;
    @IsOptional() @IsBoolean() tratamiento_check?: boolean;
    @IsOptional() @IsString() tratamiento_descripcion?: string;
    @IsOptional() @IsBoolean() retratamiento_check?: boolean;
    @IsOptional() @IsString() retratamiento_descripcion?: string;

    @IsOptional()
    @IsArray()
    pruebas_vitalidad?: any[];

    @IsOptional()
    @IsArray()
    control_tcr?: any[];

    @IsOptional()
    @IsArray()
    medicacion_intraconducto?: any[];
}
