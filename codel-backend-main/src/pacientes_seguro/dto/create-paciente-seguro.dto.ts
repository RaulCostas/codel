import { IsString, IsOptional, IsDateString, IsNumber, IsBoolean, ValidateIf } from 'class-validator';

export class CreatePacienteSeguroDto {
    // --- DATOS PERSONALES ---
    @IsDateString()
    @IsOptional()
    fecha_ingreso?: string;

    @IsString()
    @IsOptional()
    paterno?: string;

    @IsString()
    @IsOptional()
    materno?: string;

    @IsString()
    @IsOptional()
    nombre?: string;

    @IsDateString()
    @IsOptional()
    @ValidateIf((o, v) => v != null)
    fecha_nacimiento?: string;

    @IsString()
    @IsOptional()
    genero?: string;

    @IsString()
    @IsOptional()
    ci?: string;

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsString()
    @IsOptional()
    celular?: string;

    @IsString()
    @IsOptional()
    telefono?: string;

    // --- DATOS DE SEGURO ---
    @IsString()
    @IsOptional()
    matricula_seguro?: string;

    @IsBoolean()
    @IsOptional()
    es_trabajador?: boolean;

    @IsBoolean()
    @IsOptional()
    es_beneficiario?: boolean;

    // --- DATOS FÍSICOS ---
    @IsString()
    @IsOptional()
    altura?: string;

    @IsString()
    @IsOptional()
    peso?: string;

    @IsString()
    @IsOptional()
    estado?: string;

    // =====================
    // --- FICHA CLÍNICA ---
    // =====================
    @IsString()
    @IsOptional()
    motivo_consulta?: string;

    @IsString()
    @IsOptional()
    motivo_visita_anterior?: string;

    @IsString()
    @IsOptional()
    fecha_ultima_visita?: string;

    @IsBoolean()
    @IsOptional()
    complicaciones?: boolean;

    @IsString()
    @IsOptional()
    complicaciones_detalle?: string;

    @IsBoolean()
    @IsOptional()
    tratamiento_medico_actual?: boolean;

    @IsString()
    @IsOptional()
    tratamiento_medico_enfermedad?: string;

    @IsBoolean()
    @IsOptional()
    toma_medicamento?: boolean;

    @IsString()
    @IsOptional()
    medicamento_detalle?: string;

    @IsBoolean()
    @IsOptional()
    alergia_medicamento?: boolean;

    @IsString()
    @IsOptional()
    alergia_medicamento_detalle?: string;

    @IsBoolean()
    @IsOptional()
    enf_epilepsia?: boolean;

    @IsString()
    @IsOptional()
    enf_epilepsia_tratamiento?: string;

    @IsBoolean()
    @IsOptional()
    enf_anemia?: boolean;

    @IsString()
    @IsOptional()
    enf_anemia_tratamiento?: string;

    @IsBoolean()
    @IsOptional()
    enf_diabetes?: boolean;

    @IsString()
    @IsOptional()
    enf_diabetes_tratamiento?: string;

    @IsBoolean()
    @IsOptional()
    enf_tiroidismo?: boolean;

    @IsString()
    @IsOptional()
    enf_tiroidismo_tratamiento?: string;

    @IsBoolean()
    @IsOptional()
    enf_hipertension?: boolean;

    @IsString()
    @IsOptional()
    enf_hipertension_tratamiento?: string;

    @IsBoolean()
    @IsOptional()
    enf_infarto?: boolean;

    @IsString()
    @IsOptional()
    enf_infarto_tratamiento?: string;

    @IsBoolean()
    @IsOptional()
    enf_asma?: boolean;

    @IsString()
    @IsOptional()
    enf_asma_tratamiento?: string;

    @IsBoolean()
    @IsOptional()
    enf_renal?: boolean;

    @IsString()
    @IsOptional()
    enf_renal_tratamiento?: string;

    @IsBoolean()
    @IsOptional()
    enf_gastritis?: boolean;

    @IsString()
    @IsOptional()
    enf_gastritis_tratamiento?: string;

    @IsBoolean()
    @IsOptional()
    enf_otros?: boolean;

    @IsString()
    @IsOptional()
    enf_otros_detalle?: string;

    @IsString()
    @IsOptional()
    enf_otros_tratamiento?: string;

    @IsString()
    @IsOptional()
    examen_clinico_extraoral?: string;

    @IsString()
    @IsOptional()
    particularidad?: string;

    @IsNumber()
    @IsOptional()
    seguroId?: number;

    @IsNumber()
    @IsOptional()
    usuarioId?: number;
}
