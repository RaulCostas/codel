
export interface SeguimientoTrabajo {
    id: number;
    envio_retorno: 'Envio' | 'Retorno';
    fecha: string;
    observaciones: string;
    trabajoLaboratorioId: number;
}

export interface GrupoInventario {
    id: number;
    grupo: string;
    estado: string;
}

export interface UnidadMedida {
    id: number;
    nombre: string;
    estado: string;
}

export interface RecordatorioTratamiento {
    id: number;
    historiaClinicaId: number;
    historiaClinica?: HistoriaClinica;
    fechaRecordatorio: string;
    mensaje: string;
    dias: number;
    estado: string;
    createdAt: string;
    updatedAt: string;
}

export interface RecordatorioPlan {
    id: number;
    proformaId: number;
    proforma?: Proforma;
    fechaRecordatorio: string;
    dias: number;
    mensaje: string;
    estado: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    estado: string;
    password?: string; // Optional for list view
    foto?: string;
    permisos?: string[]; // Array of denied module IDs
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    estado: string;
    foto?: string;
    permisos?: string[];
}

export interface Inventario {
    id: number;
    descripcion: string;
    cantidad_existente: number;
    stock_minimo: number;
    estado: string; // 'Activo' | 'Inactivo'
    idespecialidad: number;
    idgrupo_inventario: number;
    especialidad?: Especialidad;
    grupoInventario?: GrupoInventario;
    unidadMedida?: UnidadMedida;
    egresosInventario?: EgresoInventario[];
    idunidad_medida: number;
}

export interface EgresoInventario {
    id: number;
    inventarioId: number;
    inventario?: Inventario;
    fecha: string;
    cantidad: number;
    fecha_vencimiento: string;
}

export interface Doctor {
    id: number;
    paterno: string;
    materno: string;
    nombre: string;
    celular: string;
    direccion: string;
    estado: string;
    idEspecialidad?: number;
    especialidad?: Especialidad;
}

export interface Proveedor {
    id: number;
    proveedor: string;
    celular: string;
    direccion: string;
    email: string;
    nombre_contacto: string;
    celular_contacto: string;
    estado: string;
}

export interface Personal {
    id: number;
    paterno: string;
    materno: string;
    nombre: string;
    ci: string;
    direccion: string;
    telefono: string;
    celular: string;
    fecha_nacimiento: string;
    fecha_ingreso: string;
    personal_tipo_id?: number;
    personalTipo?: PersonalTipo;
    estado: string;
    fecha_baja?: string;
}

export interface Especialidad {
    id: number;
    especialidad: string;
    estado: string;
}

export interface Arancel {
    id: number;
    detalle: string;
    precio: number;
    codigo?: string;
    moneda?: string;
    estado: string;
    idEspecialidad: number;
    idSeguro?: number;
    especialidad?: Especialidad;
    seguro?: Seguro;
}

export interface FormaPago {
    id: number;
    forma_pago: string;
    estado: string;
}

export interface Egreso {
    id: number;
    detalle: string;
    monto: number;
    moneda: 'Bolivianos' | 'Dólares';
    formaPago?: FormaPago;
    egresoTipo?: { id: number; tipo: string };
    fecha?: string;
    hora?: string;
}

export interface Laboratorio {
    id: number;
    laboratorio: string;
    celular: string;
    telefono: string;
    direccion: string;
    email: string;
    banco: string;
    numero_cuenta: string;
    estado: string;
}

export interface PrecioLaboratorio {
    id: number;
    detalle: string;
    precio: number;
    idLaboratorio: number;
    laboratorio?: Laboratorio;
    estado: string;
}

export interface Categoria {
    id: number;
    nombre: string;
    color: string;
}

export interface FichaClinicaParticular {
    id?: number;
    pacienteId?: number;

    motivo_consulta?: string;
    ultima_visita_odontologo?: string;

    // Antecedentes familiares
    ant_familiares_abuelos?: string;
    ant_familiares_padres?: string;
    ant_familiares_hermanos?: string;

    // Antecedentes patológicos
    ant_pat_tratamiento_medico?: boolean;
    tratamiento_medico_detalle?: string;
    ant_pat_hemorragias?: boolean;
    ant_pat_intervencion_quirurgica?: boolean;
    ant_pat_reaccion_anestesia?: boolean;
    reaccion_anestesia_detalle?: string;
    ant_pat_toma_medicamentos?: boolean;
    medicamento_72h_detalle?: string;
    ant_pat_alteraciones_cicatrizacion?: boolean;
    ant_pat_alergias?: boolean;
    alergia_medicamento_detalle?: string;
    ant_pat_otros?: string;

    // Antecedentes no patológicos
    ant_no_pat_fuma?: boolean;
    fuma_cantidad?: string;
    ant_no_pat_bruxismo?: boolean;
    ant_no_pat_bebe?: boolean;
    ant_no_pat_succion_digital?: boolean;
    ant_no_pat_onicofagia?: boolean;
    ant_no_pat_mordisqueo_objetos?: boolean;
    ant_no_pat_queilofagia?: boolean;
    ant_no_pat_otros?: string;
    consume_citricos?: boolean;
    cepillado_veces?: string;

    // Enfermedades
    enf_neurologicas?: boolean;
    enf_neurologicas_detalle?: string;
    enf_pulmonares?: boolean;
    enf_pulmonares_detalle?: string;
    enf_cardiacas?: boolean;
    enf_cardiacas_detalle?: string;
    enf_higado?: boolean;
    enf_higado_detalle?: string;
    enf_gastricas?: boolean;
    enf_gastricas_detalle?: string;
    enf_venereas?: boolean;
    enf_venereas_detalle?: string;
    enf_renales?: boolean;
    enf_renales_detalle?: string;
    articulaciones?: boolean;
    articulaciones_detalle?: string;
    diabetes?: boolean;
    diabetes_detalle?: string;
    hipertension?: boolean;
    hipertension_detalle?: string;
    hipotension?: boolean;
    anemia?: boolean;
    anemia_detalle?: string;
    enf_epilepsia?: boolean;
    enf_epilepsia_detalle?: string;
    enf_tiroidismo?: boolean;
    enf_tiroidismo_detalle?: string;
    enf_infarto?: boolean;
    enf_infarto_detalle?: string;
    enf_asma?: boolean;
    enf_asma_detalle?: string;

    // VIH / Embarazo
    prueba_vih?: boolean;
    prueba_vih_resultado?: string;
    anticonceptivo_hormonal?: boolean;
    anticonceptivo_hormonal_detalle?: string;
    posibilidad_embarazo?: boolean;
    semana_gestacion?: string;

    // Complicaciones / Examen
    complicaciones_si_no?: boolean;
    complicaciones_detalle?: string;
    examen_clinico_extraoral?: string;
    particularidad?: string;
    recomendado_por?: string;
    observaciones?: string;

    updatedAt?: string;
}

export interface FichaOrtodoncia {
    id?: number;
    pacienteId: number;
    proformaId: number;
    diagnostico?: string;
    ortodoncia_superior: boolean;
    ortodoncia_inferior: boolean;
    ortodoncia_bimaxilar: boolean;
    ortopedia: boolean;
    ap_ortodontico_ortopedico: boolean;
    ap_descripcion?: string;
    bandas_superior: boolean;
    bandas_inferior: boolean;
    bandas_ambos: boolean;
    tubos_superior: boolean;
    tubos_inferior: boolean;
    tubos_ambos: boolean;
    brackets_conv_metalicos: boolean;
    brackets_conv_esteticos: boolean;
    brackets_conv_combinados: boolean;
    brackets_auto_metalicos: boolean;
    brackets_auto_esteticos: boolean;
    brackets_auto_combinados: boolean;
    alineadores_superior: boolean;
    alineadores_inferior: boolean;
    alineadores_ambos: boolean;
    atp: boolean;
    arco_lingual: boolean;
    mascara_traccion_frontal: boolean;
    disyuntor_palatino_hirax: boolean;
    componentes_otros: boolean;
    componentes_otros_texto?: string;
    identificador_levantamiento_mordida: boolean;
    levantamiento_tipo?: string;
    exodoncia_ortodoncia: boolean;
    exodoncia_piezas?: string;
    tiempo_aproximado?: string;
    otros?: string;
    observaciones?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface FichaEndodoncia {
    id?: number;
    pacienteId: number;
    proformaId: number;
    pieza_dental?: string;

    // 1. Diagnóstico Clínico
    clinico_caries_dental: boolean;
    clinico_fractura_coronal: boolean;
    clinico_decoloracion_pieza: boolean;
    clinico_movilidad_dental: boolean;
    clinico_exposicion_pulpar: boolean;
    clinico_restauracion_deficiente: boolean;
    clinico_lesion_furca: boolean;
    clinico_recesion_gingival: boolean;
    clinico_atrision: boolean;
    clinico_abracion: boolean;
    clinico_abfraccion: boolean;
    clinico_alteracion_desarrollo: boolean;

    // 2. Diagnóstico Radiográfico
    radio_ligamento_ensanchado: boolean;
    radio_fractura_vertical: boolean;
    radio_fractura_horizontal: boolean;
    radio_apice_inmaduro: boolean;
    radio_caries_bajo_restauracion: boolean;
    radio_reabsorcion_externa: boolean;
    radio_reabsorcion_interna: boolean;
    radio_tcr_deficiente: boolean;
    radio_lesion_periapical: boolean;
    radio_lesion_lateral: boolean;
    radio_calcificacion_espacio: boolean;
    radio_perdida_osea: boolean;

    // 3. Dolor (Antes y Ahora) - Presencia
    dolor_pres_ninguno_antes: boolean;
    dolor_pres_ninguno_ahora: boolean;
    dolor_pres_leve_antes: boolean;
    dolor_pres_leve_ahora: boolean;
    dolor_pres_moderado_antes: boolean;
    dolor_pres_moderado_ahora: boolean;
    dolor_pres_severo_antes: boolean;
    dolor_pres_severo_ahora: boolean;

    // 3. Dolor (Antes y Ahora) - Tipo
    dolor_tipo_espontaneo_antes: boolean;
    dolor_tipo_espontaneo_ahora: boolean;
    dolor_tipo_estimulado_antes: boolean;
    dolor_tipo_estimulado_ahora: boolean;
    dolor_tipo_calor_antes: boolean;
    dolor_tipo_calor_ahora: boolean;
    dolor_tipo_frio_antes: boolean;
    dolor_tipo_frio_ahora: boolean;
    dolor_tipo_acidez_antes: boolean;
    dolor_tipo_acidez_ahora: boolean;
    dolor_tipo_dulce_antes: boolean;
    dolor_tipo_dulce_ahora: boolean;
    dolor_tipo_masticacion_antes: boolean;
    dolor_tipo_masticacion_ahora: boolean;
    dolor_tipo_constante_antes: boolean;
    dolor_tipo_constante_ahora: boolean;
    dolor_tipo_sordo_antes: boolean;
    dolor_tipo_sordo_ahora: boolean;
    dolor_tipo_palpitante_antes: boolean;
    dolor_tipo_palpitante_ahora: boolean;

    // 4. Diagnóstico Pulpar
    pulpar_sana: boolean;
    pulpar_reversible: boolean;
    pulpar_irreversible_sintomatica: boolean;
    pulpar_irreversible_asintomatica: boolean;
    pulpar_necrosis: boolean;
    pulpar_previamente_tratada: boolean;
    pulpar_tcr_sin_terminar: boolean;
    pulpar_conducto_no_sellado: boolean;

    // 5. Diagnóstico Periapical
    peri_saludable: boolean;
    peri_apical_sintomatica: boolean;
    peri_apical_asintomatica: boolean;
    peri_absceso_agudo: boolean;
    peri_absceso_cronico: boolean;
    peri_osteitis_condensante: boolean;

    // Secciones Adicionales
    observaciones: string;
    diagnostico: string;
    tratamiento_check: boolean;
    tratamiento_descripcion: string;
    retratamiento_check: boolean;
    retratamiento_descripcion: string;
    pruebas_vitalidad: EndodonciaPruebaVitalidad[];
    control_tcr: EndodonciaControlTcr[];
    medicacion_intraconducto: EndodonciaMedicacion[];

    createdAt?: string;
    updatedAt?: string;
}

export interface EndodonciaPruebaVitalidad {
    id?: number;
    pieza: string;
    frio: string;
    calor: string;
    electrica: string;
    percusion: string;
    palpacion: string;
    estado: string;
}

export interface EndodonciaControlTcr {
    id?: number;
    conductos_radiculares: string;
    punto_referencia: string;
    medida_provisional: string;
    medida_trabajo: string;
    lima_inicial: string;
    lima_maestra: string;
}

export interface EndodonciaMedicacion {
    id?: number;
    fecha: string;
    medicacion: string;
}

export interface Paciente {
    id: number;
    fecha_ingreso: string;
    paterno: string;
    materno: string;
    nombre: string;
    fecha_nacimiento: string;
    genero: string;
    ci: string;
    direccion: string;
    ocupacion: string;
    telefono_celular: string;
    email?: string;
    tutor_nombre?: string;
    tutor_ci?: string;
    estado: string;
    fichaClinica?: FichaClinicaParticular;
    seguro?: Seguro;
    odontogramas?: any[];
    fichaOrtodoncia?: FichaOrtodoncia;
    fichaEndodoncia?: FichaEndodoncia;
    celular?: string;
    observaciones?: string;
    clasificacion?: string;
    createdAt?: string;
    updatedAt?: string;
    esta_firmado?: boolean;
}

export interface FichaClinicaSeguro {
    id?: number;
    pacienteSeguroId?: number;

    ultima_visita_dental?: string;
    motivo_visita_anterior?: string;
    complicaciones?: boolean;
    complicaciones_detalle?: string;
    tratamiento_medico_actual?: boolean;
    tratamiento_medico_enfermedad?: string;
    toma_medicamento?: boolean;
    medicamento_detalle?: string;
    alergia_medicamento?: boolean;
    alergia_medicamento_detalle?: string;

    enf_epilepsia?: boolean;
    enf_epilepsia_tratamiento?: string;
    enf_anemia?: boolean;
    enf_anemia_tratamiento?: string;
    enf_diabetes?: boolean;
    enf_diabetes_tratamiento?: string;
    enf_tiroidismo?: boolean;
    enf_tiroidismo_tratamiento?: string;
    enf_hipertension?: boolean;
    enf_hipertension_tratamiento?: string;
    enf_infarto?: boolean;
    enf_infarto_tratamiento?: string;
    enf_asma?: boolean;
    enf_asma_tratamiento?: string;
    enf_renal?: boolean;
    enf_renal_tratamiento?: string;
    enf_gastritis?: boolean;
    enf_gastritis_tratamiento?: string;
    enf_otros?: boolean;
    enf_otros_detalle?: string;
    enf_otros_tratamiento?: string;
    examen_clinico_extraoral?: string;
    particularidad?: string;
    motivo_consulta?: string;
    fecha_ultima_visita?: string;

    createdAt?: string;
    updatedAt?: string;
}

export interface PacienteSeguro {
    id: number;
    fecha_ingreso: string;
    paterno: string;
    materno: string;
    nombre: string;
    fecha_nacimiento: string;
    genero: string;
    ci: string;
    direccion: string;
    celular: string;
    telefono?: string;
    matricula_seguro?: string;
    es_trabajador?: boolean;
    es_beneficiario?: boolean;
    altura?: string;
    peso?: string;
    estado: string;
    email?: string;
    observaciones?: string;
    seguro?: Seguro;
    fichaClinica?: FichaClinicaSeguro;
    historiaClinicaSeguro?: HistoriaClinicaSeguro[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ProformaSeguro {
    id: number;
    numero_proforma?: number;
    fecha: string;
    periodo: string;
    idSeguro?: number;
    seguro?: Seguro;
    total: number;
    estado: string;
    fecha_pago?: string;
    formaPagoId?: number;
    formaPago?: FormaPago;
    archivo_factura?: string;
    usuarioId?: number;
    usuario?: User;
    detalles?: HistoriaClinicaSeguro[];
    createdAt?: string;
    updatedAt?: string;
}

export interface HistoriaClinicaSeguro {
    id: number;
    pacienteSeguroId: number;
    pacienteSeguro?: PacienteSeguro;
    fecha: string;
    fechaPlanilla?: string;
    arancelId?: number;
    arancel?: Arancel;
    pieza?: string;
    cantidad: number;
    observaciones?: string;
    doctorId?: number;
    doctor?: Doctor;
    diagnostico?: string;
    precio: number;
    estadoTratamiento: string; // 'terminado' | 'no terminado'
    pagado: string; // 'si' | 'no'
    cobrado: string; // 'si' | 'no'
    proformaSeguroId?: number;
    proformaSeguro?: ProformaSeguro;
    casoClinico?: boolean;
    imagen?: string;
    imagen_descripcion?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Odontograma {
    id: number;
    pacienteId?: number;
    paciente?: Paciente;
    pacienteSeguroId?: number;
    pacienteSeguro?: PacienteSeguro;
    fecha: string;
    notas?: string;
    mapa_dientes?: any; // Record of tooth key -> { state: number, surfaces: {O, M, D, V, L/P} }
    usuarioId?: number;
}


export interface PersonalTipo {
    id: number;
    area: string;
    estado: string;
    created_at: string;
    updated_at: string;
}

export interface UpdateUserDto extends Partial<CreateUserDto> { }



export interface ProformaDetalle {
    id: number;
    proformaId: number;
    arancelId: number;
    arancel?: Arancel;
    precioUnitario: number;
    piezas: string;
    cantidad: number;
    total: number;
    posible: boolean;
}

export interface Proforma {
    id: number;
    numero: number;
    pacienteId: number;
    paciente?: Paciente;
    usuarioId: number;
    usuario?: User;
    fecha: string;
    nota: string;
    sub_total: number;
    descuento: number;
    total: number;
    detalles: ProformaDetalle[];
    esta_firmado?: boolean;
}

export interface HistoriaClinica {
    id: number;
    pacienteId: number;
    paciente?: Paciente;
    fecha: string;
    pieza?: string;
    cantidad: number;
    proformaDetalleId?: number;
    proformaDetalle?: ProformaDetalle;
    tratamiento?: string;
    observaciones?: string;
    especialidadId?: number;
    especialidad?: Especialidad;
    doctorId?: number;
    doctor?: Doctor;
    diagnostico?: string;

    estadoTratamiento: string;
    estadoPresupuesto: string;
    proformaId?: number;
    proforma?: Proforma;

    casoClinico: boolean;
    pagado: string;
    precio?: number;
    firmaPaciente?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Pago {
    id: number;
    pacienteId: number;
    paciente?: Paciente;
    fecha: string;
    proformaId?: number;
    proforma?: Proforma;
    monto: number;
    moneda: 'Bolivianos' | 'Dólares';
    tc: number;
    recibo?: string;
    factura?: string;
    formaPago: 'Efectivo' | 'QR' | 'Tarjeta';
    comisionTarjetaId?: number;
    comisionTarjeta?: ComisionTarjeta;
    observaciones?: string;
    formaPagoRel?: FormaPago;
    createdAt: string;
    updatedAt: string;
}

export interface ComisionTarjeta {
    id: number;
    redBanco: string;
    monto: number;
    estado: string;
}

export interface Agenda {
    id: number;
    fecha: string;
    hora: string;
    duracion: number;
    consultorio: number;
    pacienteId?: number;
    paciente?: Paciente;
    pacienteSeguroId?: number;
    pacienteSeguro?: PacienteSeguro;
    doctorId: number;
    doctor?: Doctor;
    proformaId?: number;
    proforma?: Proforma;
    usuarioId: number;
    usuario?: User;
    fechaAgendado: string;
    estado: string;
    tratamiento?: string;
    motivoCancelacion?: string;
}

export interface GastoFijo {
    id: number;

    dia: number;
    anual: boolean;
    mes?: string;
    gasto_fijo: string;
    monto: number;
    moneda: string;
    estado?: string;
}

export interface PagoGastoFijo {
    id: number;
    gastoFijoId: number;
    gastoFijo?: GastoFijo;
    fecha: string;
    monto: number;
    moneda: string;
    formaPagoId: number;
    formaPago?: FormaPago;
    observaciones: string;
    createdAt?: string;
}







export interface Correo {
    id: number;
    remitente_id: number;
    remitente?: User;
    destinatario_id: number;
    destinatario?: User;
    copia_id?: number;
    copia?: User;
    asunto: string;
    mensaje: string;
    fecha_envio: string;
    leido_destinatario: boolean;
    leido_copia: boolean;
    // Helper property I will use in frontend logic? No, backend sends these raw fields.
}

export interface CreateCorreoDto {
    remitente_id: number;
    destinatario_id: number;
    copia_id?: number;
    asunto: string;
    mensaje: string;
}

export interface PedidosDetalle {
    id: number;
    idpedidos: number;
    idinventario: number;
    cantidad: number;
    precio_unitario: number;
    fecha_vencimiento: string;
    inventario?: Inventario;
}

export interface Pedidos {
    id: number;
    fecha: string;
    idproveedor: number;
    Sub_Total: number;
    Descuento: number;
    Total: number;
    Observaciones: string;
    Pagado: boolean;
    proveedor?: Proveedor;
    detalles?: PedidosDetalle[];
}

export interface PagosPedidos {
    id: number;
    fecha: string;
    idPedido: number;
    pedido?: Pedidos;
    monto: number;
    factura?: string;
    recibo?: string;
    forma_pago: string;
}

export interface Cubeta {
    id: number;
    codigo: string;
    descripcion: string;
    dentro_fuera: string;
    estado: string;
}

export interface TrabajoLaboratorio {
    id: number;
    idLaboratorio: number;
    laboratorio?: Laboratorio;
    idPaciente: number;
    paciente?: Paciente;
    idprecios_laboratorios: number;
    precioLaboratorio?: PrecioLaboratorio;
    fecha: string;
    pieza: string;
    cantidad: number;
    fecha_pedido: string;
    color: string;
    estado: string;
    observacion: string;
    fecha_terminado?: string;
    pagado: string;
    precio_unitario: number;
    total: number;
    idCubeta?: number;
    cubeta?: Cubeta;
    idDoctor?: number;
    doctor?: Doctor;
    idHistoriaClinica?: number;
    historiaClinica?: HistoriaClinica;
}

export interface PropuestaDetalle {
    id: number;
    propuestaId: number;
    letra?: string;
    arancelId: number;
    arancel?: Arancel;
    precioUnitario: number;
    tc: number;
    piezas: string;
    cantidad: number;
    subTotal: number;
    descuento: number;
    total: number;
    posible: boolean;
}

export interface Propuesta {
    id: number;
    pacienteId: number;
    paciente?: Paciente;
    numero: number;
    letra?: string;
    fecha: string;
    total: number;
    nota: string;
    usuarioId: number;
    usuario?: User;
    detalles: PropuestaDetalle[];
    descuentos?: Record<string, number>;
}

export interface Calificacion {
    id: number;
    personalId: number;
    personal?: Personal;
    pacienteId: number;
    paciente?: Paciente;
    consultorio: number;
    calificacion: 'Malo' | 'Regular' | 'Bueno';
    fecha: string;
    observaciones?: string;
    evaluadorId: number;
    evaluador?: User;
    createdAt?: string;
    updatedAt?: string;
}

export interface Receta {
    id: number;
    pacienteId: number;
    paciente?: Paciente;
    userId: number;
    user?: { id: number; name: string };
    fecha: string;
    medicamentos: string;
    indicaciones: string;
    detalles?: RecetaDetalle[];
    esta_firmado?: boolean;
}

export interface RecetaDetalle {
    id: number;
    recetaId: number;
    medicamento: string;
    cantidad: string;
    indicacion: string;
}



export interface Recordatorio {
    id: number;
    tipo: 'personal' | 'consultorio';
    fecha: string;
    hora: string;
    mensaje: string;
    repetir: 'Mensual' | 'Anual' | 'Solo una vez';
    estado: 'activo' | 'inactivo';
    usuarioId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Contacto {
    id: number;
    contacto: string;
    celular?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    estado: 'activo' | 'inactivo';
    createdAt?: string;
    updatedAt?: string;
}

export interface Musica {
    id: number;
    musica: string;
    estado: string;
    created_at?: string;
    updated_at?: string;
}

export interface Television {
    id: number;
    television: string;
    estado: string;
    created_at?: string;
    updated_at?: string;
}

export interface PacienteMusica {
    id: number;
    pacienteId: number;
    musicaId: number;
}

export interface PacienteTelevision {
    id: number;
    pacienteId: number;
    televisionId: number;
}

export interface BackupInfo {
    filename: string;
    size: number;
    createdAt: string;
    path: string;
}

export interface Seguro {
    id: number;
    nombre: string;
    color: string;
    estado: string;
    nit?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    contacto_nombre?: string;
}

export interface ArancelSeguro {
    id: number;
    detalle: string;
    precio: number;
    codigo?: string;
    moneda?: string;
    estado: string;
    idEspecialidad: number;
    especialidad?: Especialidad;
    seguroId?: number;
    seguro?: Seguro;
}
