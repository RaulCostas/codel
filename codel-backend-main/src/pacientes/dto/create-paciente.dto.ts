import { IsString, IsOptional, IsDateString, IsBoolean, ValidateIf, IsNumber } from 'class-validator';

export class CreatePacienteDto {
    @IsDateString()
    @IsOptional()
    fecha_ingreso?: string;

    @IsString()
    @IsOptional()
    @ValidateIf((o, v) => v != null)
    paterno?: string;

    @IsString()
    @IsOptional()
    @ValidateIf((o, v) => v != null)
    materno?: string;

    @IsString()
    @IsOptional()
    @ValidateIf((o, v) => v != null)
    nombre?: string;

    @IsDateString()
    @IsOptional()
    @ValidateIf((o, v) => v != null)
    fecha_nacimiento?: string;

    @IsString()
    @IsOptional()
    @ValidateIf((o, v) => v != null)
    genero?: string;

    @IsString()
    @IsOptional()
    @ValidateIf((o, v) => v != null)
    ci?: string;

    @IsString()
    @IsOptional()
    @ValidateIf((o, v) => v != null)
    direccion?: string;

    @IsString()
    @IsOptional()
    @ValidateIf((o, v) => v != null)
    ocupacion?: string;

    @IsString()
    @IsOptional()
    @ValidateIf((o, v) => v != null)
    telefono_celular?: string;

    @IsString()
    @IsOptional()
    @ValidateIf((o, v) => v != null)
    email?: string;

    @IsString()
    @IsOptional()
    tutor_nombre?: string;

    @IsString()
    @IsOptional()
    tutor_ci?: string;

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
    ant_familiares_abuelos?: string;

    @IsString()
    @IsOptional()
    ant_familiares_padres?: string;

    @IsString()
    @IsOptional()
    ant_familiares_hermanos?: string;

    @IsBoolean()
    @IsOptional()
    ant_pat_tratamiento_medico?: boolean;

    @IsString()
    @IsOptional()
    tratamiento_medico_detalle?: string;

    @IsBoolean()
    @IsOptional()
    ant_pat_hemorragias?: boolean;

    @IsBoolean()
    @IsOptional()
    ant_pat_intervencion_quirurgica?: boolean;

    @IsBoolean()
    @IsOptional()
    ant_pat_reaccion_anestesia?: boolean;

    @IsString()
    @IsOptional()
    reaccion_anestesia_detalle?: string;

    @IsBoolean()
    @IsOptional()
    ant_pat_toma_medicamentos?: boolean;

    @IsString()
    @IsOptional()
    medicamento_72h_detalle?: string;

    @IsBoolean()
    @IsOptional()
    ant_pat_alteraciones_cicatrizacion?: boolean;

    @IsBoolean()
    @IsOptional()
    ant_pat_alergias?: boolean;

    @IsString()
    @IsOptional()
    alergia_medicamento_detalle?: string;

    @IsString()
    @IsOptional()
    ant_pat_otros?: string;

    @IsBoolean()
    @IsOptional()
    ant_no_pat_fuma?: boolean;

    @IsString()
    @IsOptional()
    fuma_cantidad?: string;

    @IsBoolean()
    @IsOptional()
    ant_no_pat_bruxismo?: boolean;

    @IsBoolean()
    @IsOptional()
    ant_no_pat_bebe?: boolean;

    @IsBoolean()
    @IsOptional()
    ant_no_pat_succion_digital?: boolean;

    @IsBoolean()
    @IsOptional()
    ant_no_pat_onicofagia?: boolean;

    @IsBoolean()
    @IsOptional()
    ant_no_pat_mordisqueo_objetos?: boolean;

    @IsBoolean()
    @IsOptional()
    ant_no_pat_queilofagia?: boolean;

    @IsString()
    @IsOptional()
    ant_no_pat_otros?: string;

    @IsString()
    @IsOptional()
    particularidad?: string;

    @IsString()
    @IsOptional()
    recomendado_por?: string;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsNumber()
    @IsOptional()
    usuarioId?: number;
}
