import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import type { Paciente, PacienteSeguro } from '../types';
import { formatDate } from '../utils/dateUtils';
import { Heart, User, Stethoscope, Shield, Info } from 'lucide-react';
import ManualModal, { type ManualSection } from './ManualModal';

interface PacienteTabFichaProps {
    tipo: 'particular' | 'seguro';
}

const PacienteTabFicha: React.FC<PacienteTabFichaProps> = ({ tipo }) => {
    const { id } = useParams<{ id: string }>();
    const [paciente, setPaciente] = useState<Paciente | PacienteSeguro | null>(null);
    const [loading, setLoading] = useState(true);
    const [showManual, setShowManual] = useState(false);

    const manualSections: ManualSection[] = [
        {
            title: 'Ficha Clínica del Paciente',
            content: 'Aquí se muestran los datos personales, de contacto y los antecedentes médicos del paciente registrados durante su inscripción.'
        },
        {
            title: 'Antecedentes Patológicos',
            content: 'Si el paciente tiene condiciones médicas especiales (alergias, diabetes, cirugías, etc.), aparecerán resaltadas en rojo para alertar al personal clínico.'
        },
        {
            title: 'Editar Información',
            content: 'Para modificar estos datos, debe utilizar el botón "Editar Paciente" en la cabecera del perfil.'
        }
    ];

    useEffect(() => {
        if (!id) return;
        const url = tipo === 'particular' ? `/pacientes/${id}` : `/pacientes-seguro/${id}`;
        api.get(url)
            .then(r => setPaciente(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id, tipo]);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!paciente) return <div className="text-center py-10 text-gray-400">No se pudo cargar la ficha.</div>;

    const ficha = paciente.fichaClinica;

    const calcEdad = (fecha?: string) => {
        if (!fecha) return '—';
        const hoy = new Date(); const nac = new Date(fecha);
        let edad = hoy.getFullYear() - nac.getFullYear();
        const m = hoy.getMonth() - nac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
        return `${edad} años`;
    };

    const Field = ({ label, value }: { label: string; value?: string | number | null | boolean }) => (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</span>
            <span className="text-sm text-gray-800 dark:text-gray-100 font-medium border-b border-dashed border-gray-200 dark:border-gray-700 pb-1 min-h-[22px]">
                {value === true ? 'SÍ' : value === false ? 'NO' : (value ?? <span className="text-gray-400 font-normal italic">—</span>)}
            </span>
        </div>
    );

    const CheckBadge = ({ label, value }: { label: string; value?: boolean }) => (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${value
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-700'
        }`}>
            <span>{value ? '☑' : '☐'}</span> {label}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-end px-1">
                <button
                    onClick={() => setShowManual(true)}
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-1.5 rounded-full flex items-center justify-center w-[30px] h-[30px] text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
                    title="Ayuda / Manual"
                >
                    ?
                </button>
            </div>
            
            <div className="content-card bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 transition-colors">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* — FILIACIÓN Y DATOS PERSONALES — */}
                    <div>
                        <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                            <User size={16} className="text-blue-500" /> 
                            {tipo === 'seguro' ? 'Filiación Seguro' : 'Datos Personales'}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Fecha Ingreso" value={paciente.fecha_ingreso ? formatDate(paciente.fecha_ingreso) : undefined} />
                            
                            {tipo === 'seguro' ? (
                                <>
                                    <Field label="Matrícula Seguro" value={(paciente as PacienteSeguro).matricula_seguro} />
                                    <div className="col-span-2 flex gap-4">
                                        <CheckBadge label="Es Trabajador" value={(paciente as PacienteSeguro).es_trabajador} />
                                        <CheckBadge label="Es Beneficiario" value={(paciente as PacienteSeguro).es_beneficiario} />
                                    </div>
                                    <Field label="Ap. Paterno" value={paciente.paterno} />
                                    <Field label="Ap. Materno" value={paciente.materno} />
                                    <Field label="Nombres" value={paciente.nombre} />
                                    <Field label="C.I. / Documento" value={paciente.ci} />
                                    <Field label="Fecha Nacimiento" value={paciente.fecha_nacimiento ? `${formatDate(paciente.fecha_nacimiento)} (${calcEdad(paciente.fecha_nacimiento)})` : undefined} />
                                    <Field label="Género" value={paciente.genero === 'M' ? 'Masculino' : 'Femenino'} />
                                    <Field label="Altura" value={(paciente as PacienteSeguro).altura} />
                                    <Field label="Peso" value={(paciente as PacienteSeguro).peso} />
                                </>
                            ) : (
                                <>
                                    <Field label="Ap. Paterno" value={paciente.paterno} />
                                    <Field label="Ap. Materno" value={paciente.materno} />
                                    <Field label="Nombres" value={paciente.nombre} />
                                    <Field label="Fecha Nacimiento" value={paciente.fecha_nacimiento ? `${formatDate(paciente.fecha_nacimiento)} (${calcEdad(paciente.fecha_nacimiento)})` : undefined} />
                                    <Field label="Género" value={paciente.genero === 'M' ? 'Masculino' : 'Femenino'} />
                                    <Field label="C.I. / Documento" value={paciente.ci} />
                                </>
                            )}
                        </div>

                        <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mt-6 mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                            <User size={16} className="text-blue-500" /> Contacto
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Field label="Dirección" value={paciente.direccion} />
                            </div>
                            <Field label="Celular" value={tipo === 'seguro' ? (paciente as PacienteSeguro).celular : (paciente as Paciente).telefono_celular} />
                            <Field label="Teléfono Fijo" value={tipo === 'seguro' ? (paciente as PacienteSeguro).telefono : undefined} />
                            {tipo === 'particular' && <Field label="Email" value={(paciente as Paciente).email} />}
                            {tipo === 'particular' && <Field label="Ocupación" value={(paciente as Paciente).ocupacion} />}
                        </div>

                        {tipo === 'particular' && (paciente as Paciente).tutor_nombre && (
                            <>
                                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mt-6 mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                                    <User size={16} className="text-amber-500" /> Tutor / Responsable
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Nombre Tutor" value={(paciente as Paciente).tutor_nombre} />
                                    <Field label="CI Tutor" value={(paciente as Paciente).tutor_ci} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* — FICHA MÉDICA / CLÍNICA — */}
                    <div>
                        <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                            <Heart size={16} className="text-red-500" /> Ficha Médica
                        </h3>
                        
                        {ficha ? (
                            <div className="space-y-6">
                                {tipo === 'particular' ? (
                                    <>
                                        {/* Vista Particular (Existente) */}
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Información Clínica y Consulta</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <Field label="Motivo de Consulta" value={(ficha as any).motivo_consulta} />
                                                <Field label="Recomendado por" value={(ficha as any).recomendado_por} />
                                            </div>
                                        </div>
                                        {/* ... (resto de campos particulares) ... */}
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Antecedentes Patológicos</p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                <CheckBadge label="Tratamiento Médico" value={(ficha as any).ant_pat_tratamiento_medico} />
                                                <CheckBadge label="Hemorragias" value={(ficha as any).ant_pat_hemorragias} />
                                                <CheckBadge label="Cirugías" value={(ficha as any).ant_pat_intervencion_quirurgica} />
                                                <CheckBadge label="Alergias" value={(ficha as any).ant_pat_alergias} />
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mt-4">
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Observaciones</p>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap">{(ficha as any).observaciones || 'Ninguna'}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* VISTA SEGURO (NUEVA ESTRUCTURA) */}
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Visita Dental</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <Field label="Motivo de Consulta" value={(ficha as any).motivo_consulta} />
                                                </div>
                                                <Field label="Motivo Visita Anterior" value={(ficha as any).motivo_visita_anterior} />
                                                <Field label="Fecha Última Visita" value={(ficha as any).fecha_ultima_visita} />
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Antecedentes Médicos</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <CheckBadge label="Tratamiento Médico Actual" value={(ficha as any).tratamiento_medico_actual} />
                                                    {(ficha as any).tratamiento_medico_actual && (
                                                        <div className="pl-4"><Field label="Enfermedad" value={(ficha as any).tratamiento_medico_enfermedad} /></div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <CheckBadge label="Toma Medicamentos" value={(ficha as any).toma_medicamento} />
                                                    {(ficha as any).toma_medicamento && (
                                                        <div className="pl-4"><Field label="Medicamento" value={(ficha as any).medicamento_detalle} /></div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <CheckBadge label="Alergias" value={(ficha as any).alergia_medicamento} />
                                                    {(ficha as any).alergia_medicamento && (
                                                        <div className="pl-4"><Field label="Detalle Alergia" value={(ficha as any).alergia_medicamento_detalle} /></div>
                                                    )}
                                                </div>
                                                <CheckBadge label="Complicaciones" value={(ficha as any).complicaciones} />
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Enfermedades y Tratamientos</p>
                                            <div className="grid grid-cols-1 gap-3">
                                                {[
                                                    { label: 'Epilepsia', val: (ficha as any).enf_epilepsia, txt: (ficha as any).enf_epilepsia_tratamiento },
                                                    { label: 'Anemia', val: (ficha as any).enf_anemia, txt: (ficha as any).enf_anemia_tratamiento },
                                                    { label: 'Diabetes', val: (ficha as any).enf_diabetes, txt: (ficha as any).enf_diabetes_tratamiento },
                                                    { label: 'Tiroidismo', val: (ficha as any).enf_tiroidismo, txt: (ficha as any).enf_tiroidismo_tratamiento },
                                                    { label: 'Hipertensión', val: (ficha as any).enf_hipertension, txt: (ficha as any).enf_hipertension_tratamiento },
                                                    { label: 'Infarto', val: (ficha as any).enf_infarto, txt: (ficha as any).enf_infarto_tratamiento },
                                                    { label: 'Asma', val: (ficha as any).enf_asma, txt: (ficha as any).enf_asma_tratamiento },
                                                    { label: 'Renal', val: (ficha as any).enf_renal, txt: (ficha as any).enf_renal_tratamiento },
                                                    { label: 'Gastritis', val: (ficha as any).enf_gastritis, txt: (ficha as any).enf_gastritis_tratamiento },
                                                    { label: 'Otros', val: (ficha as any).enf_otros, txt: (ficha as any).enf_otros_tratamiento, det: (ficha as any).enf_otros_detalle },
                                                ].filter(e => e.val).map((e, i) => (
                                                    <div key={i} className="bg-red-50/50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">{e.label}</span>
                                                            <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 px-2 py-0.5 rounded-full font-bold">ACTIVO</span>
                                                        </div>
                                                        {e.det && <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1"><span className="font-bold">Detalle:</span> {e.det}</p>}
                                                        <p className="text-xs text-gray-700 dark:text-gray-300"><span className="font-bold">Tratamiento:</span> {e.txt || '---'}</p>
                                                    </div>
                                                ))}
                                                { ![(ficha as any).enf_epilepsia, (ficha as any).enf_anemia, (ficha as any).enf_diabetes, (ficha as any).enf_tiroidismo, (ficha as any).enf_hipertension, (ficha as any).enf_infarto, (ficha as any).enf_asma, (ficha as any).enf_renal, (ficha as any).enf_gastritis, (ficha as any).enf_otros].some(Boolean) && (
                                                    <p className="text-sm text-gray-400 italic py-2">No se registraron enfermedades.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 pt-2">
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Examen Clínico Extraoral</p>
                                                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap">{(ficha as any).examen_clinico_extraoral || 'Sin observaciones'}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Particularidad / Observaciones</p>
                                                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap">{(ficha as any).particularidad || 'Sin particularidades'}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400">
                                <Stethoscope size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No se ha registrado ficha médica.</p>
                                <p className="text-sm mt-1">Edite el paciente para completar la ficha médica.</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <ManualModal 
                    isOpen={showManual}
                    onClose={() => setShowManual(false)}
                    title="Manual de Usuario - Ficha Clínica"
                    sections={manualSections}
                />
            </div>
        </div>
    );
};

export default PacienteTabFicha;
