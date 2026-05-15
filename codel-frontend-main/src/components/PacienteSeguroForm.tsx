import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import ManualModal, { type ManualSection } from './ManualModal';
import { getLocalDateString } from '../utils/dateUtils';
import { ArrowLeft, User, Users, Activity, Info, Calendar, MapPin, Phone, HelpCircle, Save, X, Shield, Heart } from 'lucide-react';

const PacienteSeguroForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;
    const [showManual, setShowManual] = useState(false);

    const [countryCode, setCountryCode] = useState('+591');
    const [localCelular, setLocalCelular] = useState('');

    const countryCodes = [
        { code: '+591', label: '🇧🇴 +591' },
        { code: '+54', label: '🇦🇷 +54' },
        { code: '+55', label: '🇧🇷 +55' },
        { code: '+56', label: '🇨🇱 +56' },
        { code: '+51', label: '🇵🇪 +51' },
        { code: '+595', label: '🇵🇾 +595' },
        { code: '+598', label: '🇺🇾 +598' },
        { code: '+57', label: '🇨🇴 +57' },
        { code: '+52', label: '🇲🇽 +52' },
        { code: '+34', label: '🇪🇸 +34' },
        { code: '+1', label: '🇺🇸 +1' },
    ];

    const manualSections: ManualSection[] = [
        {
            title: 'Registro de Pacientes Seguro',
            content: 'Complete la filiación y antecedentes médicos para pacientes con cobertura de seguro.'
        }
    ];

    const [formData, setFormData] = useState({
        fecha_ingreso: getLocalDateString(),
        paterno: '',
        materno: '',
        nombre: '',
        fecha_nacimiento: '',
        genero: '',
        ci: '',
        direccion: '',
        celular: '',
        telefono: '',
        matricula_seguro: '',
        es_trabajador: false,
        es_beneficiario: false,
        altura: '',
        peso: '',
        estado: 'activo',

        // FICHA CLINICA SEGURO
        motivo_consulta: '',
        motivo_visita_anterior: '',
        fecha_ultima_visita: '',
        complicaciones: false,
        complicaciones_detalle: '',
        tratamiento_medico_actual: false,
        tratamiento_medico_enfermedad: '',
        toma_medicamento: false,
        medicamento_detalle: '',
        alergia_medicamento: false,
        alergia_medicamento_detalle: '',
        
        // ENFERMEDADES
        enf_epilepsia: false,
        enf_epilepsia_tratamiento: '',
        enf_anemia: false,
        enf_anemia_tratamiento: '',
        enf_diabetes: false,
        enf_diabetes_tratamiento: '',
        enf_tiroidismo: false,
        enf_tiroidismo_tratamiento: '',
        enf_hipertension: false,
        enf_hipertension_tratamiento: '',
        enf_infarto: false,
        enf_infarto_tratamiento: '',
        enf_asma: false,
        enf_asma_tratamiento: '',
        enf_renal: false,
        enf_renal_tratamiento: '',
        enf_gastritis: false,
        enf_gastritis_tratamiento: '',
        enf_otros: false,
        enf_otros_detalle: '',
        enf_otros_tratamiento: '',
        
        examen_clinico_extraoral: '',
        particularidad: '',
        seguroId: 0
    });

    const [seguros, setSeguros] = useState<any[]>([]);

    useEffect(() => {
        fetchSeguros();
        if (isEditing) fetchPaciente();
    }, [id]);

    const fetchSeguros = async () => {
        try {
            const response = await api.get('/seguro');
            setSeguros(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching particular seguros:', error);
        }
    };

    const fetchPaciente = async () => {
        try {
            const response = await api.get(`/pacientes-seguro/${id}`);
            const data = response.data.data || response.data;
            if (data.fichaClinica) {
                const { id: fichaId, createdAt, updatedAt, ...fichaData } = data.fichaClinica;
                const merged = { ...data, ...fichaData };
                setFormData(merged);
                
                if (merged.celular) {
                    const celularStr = String(merged.celular);
                    const foundCode = countryCodes.find(c => celularStr.startsWith(c.code));
                    if (foundCode) {
                        setCountryCode(foundCode.code);
                        setLocalCelular(celularStr.substring(foundCode.code.length));
                    } else {
                        setLocalCelular(celularStr);
                    }
                }
            } else {
                setFormData(data);
                if (data.celular) {
                    const celularStr = String(data.celular);
                    const foundCode = countryCodes.find(c => celularStr.startsWith(c.code));
                    if (foundCode) {
                        setCountryCode(foundCode.code);
                        setLocalCelular(celularStr.substring(foundCode.code.length));
                    } else {
                        setLocalCelular(celularStr);
                    }
                }
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar el paciente', 'error');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // --- VALIDATIONS ---
        if (!formData.matricula_seguro) {
            Swal.fire('Error', 'La Matrícula de Seguro es obligatoria', 'error');
            return;
        }
        if (!formData.es_trabajador && !formData.es_beneficiario) {
            Swal.fire('Error', 'Debe seleccionar si es Trabajador o Beneficiario', 'error');
            return;
        }

        try {
            const payload: any = { 
                ...formData,
                celular: `${countryCode}${localCelular}`
            };

            // Add user ID for auditing
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.id) payload.usuarioId = Number(user.id);
                } catch (e) {
                    console.error("Error parsing user for auditing", e);
                }
            }

            // Clean empty strings for dates to avoid validation errors
            if (payload.fecha_nacimiento === '') delete payload.fecha_nacimiento;
            if (payload.fecha_ingreso === '') delete payload.fecha_ingreso;
            if (payload.fecha_ultima_visita === '') delete payload.fecha_ultima_visita;

            // Handle seguroId 0 as null
            if (payload.seguroId === 0 || payload.seguroId === '0') {
                payload.seguroId = null;
            } else {
                payload.seguroId = Number(payload.seguroId);
            }

            delete payload.fichaClinica;
            delete payload.createdAt;
            delete payload.updatedAt;

            if (isEditing) {
                await api.patch(`/pacientes-seguro/${id}`, payload);
                Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
            } else {
                await api.post('/pacientes-seguro', payload);
                Swal.fire({ icon: 'success', title: 'Registrado', timer: 1500, showConfirmButton: false });
            }
            navigate('/pacientes-seguro');
        } catch (error: any) {
            console.error('Error saving patient:', error);
            let message = 'Error al guardar';
            if (error.response?.data?.message) {
                message = Array.isArray(error.response.data.message) 
                    ? error.response.data.message.join('\n') 
                    : error.response.data.message;
            }
            Swal.fire('Error', message, 'error');
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen mb-20 font-sans text-gray-800 dark:text-gray-100">
            <div className="flex items-center justify-between mb-10 border-b pb-4 border-gray-200 dark:border-gray-700">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-4">
                        <span className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400 shadow-sm border border-purple-200 dark:border-purple-800">
                            <Shield size={32} />
                        </span>
                        <div>
                            {isEditing ? 'Ficha Paciente Seguro' : 'Nuevo Paciente Seguro'}
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                                {isEditing ? 'Edición de filiación y antecedentes de seguro' : 'Registro integral para pacientes de convenio'}
                            </p>
                        </div>
                    </h1>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowManual(true)} 
                  className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-1.5 rounded-full flex items-center justify-center w-[30px] h-[30px] text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors self-center mr-2"
                  title="Ayuda / Manual"
                >
                    ?
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* --- FILIACIÓN --- */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center mb-6 pb-2 border-b border-purple-500/20">
                        <User size={24} className="text-purple-600 mr-4" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">Filiación Seguro</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* 1. Aseguradora (Empresa) - FIRST DATA */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Aseguradora <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select 
                                    name="seguroId" 
                                    value={formData.seguroId} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans appearance-none"
                                >
                                    <option value={0}>Seleccione Seguro...</option>
                                    {seguros.map(s => (
                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 2. Fecha Ingreso */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Fecha Ingreso</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="date" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={handleChange} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>

                        {/* 3. Matricula Seguro (Mandatory) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Matrícula Seguro <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="matricula_seguro" value={formData.matricula_seguro} onChange={handleChange} required placeholder="Obligatorio" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>

                        {/* 3.1 & 3.2 Es Trabajador / Es Beneficiario (Stacked) */}
                        <div className="flex flex-col justify-center gap-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="tipo_afiliado" 
                                    checked={formData.es_trabajador} 
                                    onChange={() => setFormData(prev => ({ ...prev, es_trabajador: true, es_beneficiario: false }))} 
                                    className="w-4 h-4 border-gray-300 text-purple-600 focus:ring-blue-500 bg-white dark:bg-gray-700" 
                                />
                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 font-sans uppercase tracking-tight">Es Trabajador</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="tipo_afiliado" 
                                    checked={formData.es_beneficiario} 
                                    onChange={() => setFormData(prev => ({ ...prev, es_trabajador: false, es_beneficiario: true }))} 
                                    className="w-4 h-4 border-gray-300 text-purple-600 focus:ring-blue-500 bg-white dark:bg-gray-700" 
                                />
                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 font-sans uppercase tracking-tight">Es Beneficiario</span>
                            </label>
                        </div>

                        {/* 5. Paterno */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Paterno <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="paterno" value={formData.paterno} onChange={handleChange} required placeholder="Apellido Paterno" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>

                        {/* 6. Materno */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Materno</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="materno" value={formData.materno} onChange={handleChange} placeholder="Apellido Materno" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>

                        {/* 7. Nombre */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Nombre <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Nombres" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>

                        {/* 8. C.I. */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">C.I.</label>
                            <div className="relative">
                                <Info size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="ci" value={formData.ci} onChange={handleChange} placeholder="Nro de Documento" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>

                        {/* 9. Fecha Nacimiento (edad) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Nacimiento <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required className="w-full pl-10 pr-12 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                                {formData.fecha_nacimiento && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-700 pointer-events-none">
                                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 font-sans">
                                            {(() => {
                                                const birth = new Date(formData.fecha_nacimiento);
                                                const today = new Date();
                                                let age = today.getFullYear() - birth.getFullYear();
                                                if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
                                                return age;
                                            })()}a
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 9.1 Género */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Género <span className="text-red-500">*</span></label>
                            <select name="genero" value={formData.genero} onChange={handleChange} required className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans">
                                <option value="">Seleccionar...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>

                        {/* 10. Altura */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Altura (cm)</label>
                            <div className="relative">
                                <Activity size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="altura" value={formData.altura} onChange={handleChange} placeholder="Ej: 170" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>

                        {/* 11. Peso */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Peso (kg)</label>
                            <div className="relative">
                                <Activity size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="peso" value={formData.peso} onChange={handleChange} placeholder="Ej: 70" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>

                        {/* 13. Celular */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Celular <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="py-2 px-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-sans">
                                    {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                                </select>
                                <div className="relative flex-1">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input type="text" value={localCelular} onChange={(e) => setLocalCelular(e.target.value)} required placeholder="70012345" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                                </div>
                            </div>
                        </div>

                        {/* 12. Direccion */}
                        <div className="md:col-span-3">
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Dirección</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección del domicilio" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>

                        {/* 14. Telefono Fijo */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Teléfono Fijo</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono de casa" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- INFORMACIÓN CLÍNICA (FICHA) --- */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 animate-slide-up">
                    <div className="flex items-center mb-6 pb-2 border-b border-green-500/20">
                        <Activity size={24} className="text-green-600 mr-4" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider font-sans">Información Clínica y Consulta</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2 font-sans">
                                <HelpCircle size={16} className="text-blue-500" /> Motivo de Consulta
                            </label>
                            <div className="relative">
                                <HelpCircle size={18} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                                <textarea name="motivo_consulta" value={formData.motivo_consulta} onChange={handleChange} rows={2} placeholder="¿Por qué acude el paciente?" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none font-sans" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Motivo Visita Anterior</label>
                            <div className="relative">
                                <Activity size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="motivo_visita_anterior" value={formData.motivo_visita_anterior} onChange={handleChange} placeholder="Última consulta dental" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 font-sans">Fecha Última Visita</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="fecha_ultima_visita" value={formData.fecha_ultima_visita} onChange={handleChange} placeholder="Ej: Hace 6 meses" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ANTECEDENTES MÉDICOS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* PATOLOGICOS */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-red-50 dark:border-red-900/30">
                        <div className="flex items-center mb-6 pb-2 border-b border-red-500/20">
                            <Heart size={24} className="text-red-600 mr-4" />
                            <h2 className="text-lg font-bold uppercase font-sans">Antecedentes Generales</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: 'complicaciones', label: 'Complicaciones Dentales', detailId: 'complicaciones_detalle', placeholder: '¿Cuáles?' },
                                { id: 'tratamiento_medico_actual', label: 'Tratamiento Médico Actual', detailId: 'tratamiento_medico_enfermedad', placeholder: '¿Para qué enfermedad?' },
                                { id: 'toma_medicamento', label: 'Toma Medicamentos', detailId: 'medicamento_detalle', placeholder: '¿Cuáles y dosis?' },
                                { id: 'alergia_medicamento', label: 'Alergias a Medicamentos', detailId: 'alergia_medicamento_detalle', placeholder: '¿Cuáles?' },
                            ].map((item: any) => (
                                <div key={item.id} className="p-4 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100/50 dark:border-red-900/20 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase font-sans">{item.label}</span>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-1 cursor-pointer group">
                                                <input type="radio" checked={formData[item.id as keyof typeof formData] === true} onChange={() => setFormData({ ...formData, [item.id]: true })} className="w-4 h-4 text-red-600 focus:ring-blue-500" />
                                                <span className="text-[10px] font-black group-hover:text-red-600 font-sans">SÍ</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer group">
                                                <input type="radio" checked={formData[item.id as keyof typeof formData] === false} onChange={() => setFormData({ ...formData, [item.id]: false })} className="w-4 h-4 text-red-600 focus:ring-blue-500" />
                                                <span className="text-[10px] font-black group-hover:text-red-600 font-sans">NO</span>
                                            </label>
                                        </div>
                                    </div>
                                    {formData[item.id as keyof typeof formData] === true && (
                                        <input type="text" name={item.detailId} value={formData[item.detailId as keyof typeof formData] as string} onChange={handleChange} placeholder={item.placeholder} className="w-full px-4 py-2 text-xs rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 font-sans" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DATOS FÍSICOS (Now empty since Altura/Peso moved) - Removed redundant block */}
                </div>

                {/* ENFERMEDADES LIST */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2 mb-6 font-sans">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                        Listado de Enfermedades
                    </h3>
                    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <table className="w-full border-collapse text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/60">
                                <tr>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-wider font-sans">Enfermedades</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-wider text-center font-sans">Padece</th>
                                    <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-wider font-sans">Tratamiento</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {[
                                    { id: 'enf_epilepsia', label: 'Epilepsia o Convulsiones' },
                                    { id: 'enf_anemia', label: 'Anemia' },
                                    { id: 'enf_diabetes', label: 'Diabetes' },
                                    { id: 'enf_tiroidismo', label: 'Hiper o Hipotiroidismo' },
                                    { id: 'enf_hipertension', label: 'Hipertensión Arterial' },
                                    { id: 'enf_infarto', label: 'Infarto al miocardio' },
                                    { id: 'enf_asma', label: 'Asma' },
                                    { id: 'enf_renal', label: 'Insuficiencia renal' },
                                    { id: 'enf_gastritis', label: 'Gastritis' }
                                ].map((enf, idx) => (
                                    <tr key={enf.id} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/30 dark:bg-gray-900/20'}>
                                        <td className="p-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase font-sans">{enf.label}</td>
                                        <td className="p-4 text-center">
                                            <input type="checkbox" name={enf.id} checked={formData[enf.id as keyof typeof formData] as boolean} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                        </td>
                                        <td className="p-4">
                                            <input type="text" name={`${enf.id}_tratamiento`} value={formData[`${enf.id}_tratamiento` as keyof typeof formData] as string} onChange={handleChange} placeholder="Tratamiento..." className="w-full px-4 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-blue-50/20 dark:bg-blue-900/10">
                                    <td className="p-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase font-sans">
                                        Otros
                                    </td>
                                    <td className="p-4 text-center">
                                        <input type="checkbox" name="enf_otros" checked={formData.enf_otros} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                    </td>
                                    <td className="p-4">
                                        <input type="text" name="enf_otros_tratamiento" value={formData.enf_otros_tratamiento} onChange={handleChange} placeholder="Tratamiento..." className="w-full px-4 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none font-sans" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* EXAMEN CLINICO */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center mb-6 pb-2 border-b border-gray-500/20">
                        <Info size={24} className="text-gray-600 mr-4" />
                        <h2 className="text-xl font-bold uppercase tracking-wider font-sans">Examen Clínico y Otros</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase ml-1 mb-1 font-sans">Particularidad</label>
                            <div className="relative">
                                <Info size={18} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                                <textarea name="particularidad" value={formData.particularidad} onChange={handleChange} rows={3} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase ml-1 mb-1 font-sans">Examen Clínico Extraoral</label>
                            <div className="relative">
                                <Activity size={18} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                                <textarea name="examen_clinico_extraoral" value={formData.examen_clinico_extraoral} onChange={handleChange} rows={3} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACCIONES */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 flex justify-center gap-6 z-20">
                    <button type="submit" className="px-12 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest shadow-xl transform hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
                        <Save size={20} />
                        {isEditing ? 'Actualizar' : 'Guardar'}
                    </button>
                    <button type="button" onClick={() => navigate('/pacientes-seguro')} className="px-12 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-black uppercase tracking-widest shadow-xl transform hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
                        <X size={20} />
                        Cancelar
                    </button>
                </div>
            </form>

            <ManualModal isOpen={showManual} onClose={() => setShowManual(false)} title="Ayuda: Ficha Seguro" sections={manualSections} />
        </div>
    );
};

export default PacienteSeguroForm;
