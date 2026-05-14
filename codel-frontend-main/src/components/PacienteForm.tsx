import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import ManualModal, { type ManualSection } from './ManualModal';
import SignatureModal from './SignatureModal';
import { getLocalDateString } from '../utils/dateUtils';
import { ArrowLeft, User, Users, Activity, Wind, Info, Edit, Mail, Calendar, MapPin, Phone, Briefcase, HelpCircle, Save, X, Fingerprint, Search, Plus } from 'lucide-react';

const PacienteForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showManual, setShowManual] = useState(false);

    // New state for phone country code
    const [countryCode, setCountryCode] = useState('+591');
    const [localCelular, setLocalCelular] = useState('');
    const [newPatientId, setNewPatientId] = useState<number | null>(null);

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

    useEffect(() => {
        if (location.state?.openSignature) {
            setShowSignatureModal(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const manualSections: ManualSection[] = [
        {
            title: 'Registro de Pacientes',
            content: 'Complete la filiación y antecedentes médicos. Los campos con * son obligatorios.'
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
        ocupacion: '',
        telefono_celular: '',
        email: '',
        tutor_nombre: '',
        tutor_ci: '',
        observaciones: '',
        estado: 'activo',
        // FICHA CLÍNICA
        motivo_consulta: '',
        ant_familiares_abuelos: '',
        ant_familiares_padres: '',
        ant_familiares_hermanos: '',
        ant_pat_tratamiento_medico: false,
        ant_pat_hemorragias: false,
        ant_pat_intervencion_quirurgica: false,
        ant_pat_reaccion_anestesia: false,
        ant_pat_toma_medicamentos: false,
        ant_pat_alteraciones_cicatrizacion: false,
        ant_pat_alergias: false,
        ant_pat_otros: '',
        ant_no_pat_fuma: false,
        ant_no_pat_bruxismo: false,
        ant_no_pat_bebe: false,
        ant_no_pat_succion_digital: false,
        ant_no_pat_onicofagia: false,
        ant_no_pat_mordisqueo_objetos: false,
        ant_no_pat_queilofagia: false,
        ant_no_pat_otros: '',
        fuma_cantidad: '',
        tratamiento_medico_detalle: '',
        medicamento_72h_detalle: '',
        alergia_medicamento_detalle: '',
        reaccion_anestesia_detalle: '',
        recomendado_por: '',
    });

    const handleVolver = () => {
        navigate(`/pacientes`);
    };

    useEffect(() => {
        if (isEditing) {
            fetchPaciente();
        }
    }, [id]);



    const fetchPaciente = async () => {
        try {
            const response = await api.get(`/pacientes/${id}`);
            const data = response.data;
            
            // Flatten fichaClinica into the main object so the form fields can read it
            const flatData = {
                ...data,
                ...(data.fichaClinica || {})
            };
            setFormData(flatData);

            // Handle splitting telefono_celular into code and number
            if (flatData.telefono_celular) {
                const celularStr = String(flatData.telefono_celular);
                const foundCode = countryCodes.find(c => celularStr.startsWith(c.code));
                if (foundCode) {
                    setCountryCode(foundCode.code);
                    setLocalCelular(celularStr.substring(foundCode.code.length));
                } else {
                    setLocalCelular(celularStr);
                }
            }

            // Removed Odontogram Fetching - Moved to Clinical History
        } catch (error) {
            console.error('Error fetching paciente:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar el paciente' });
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Combine code and local number
        const fullCelular = `${countryCode}${localCelular}`;

        // Create a clean payload removing null values
        const payload: any = { ...formData };
        Object.entries(payload).forEach(([key, value]) => {
            // Remove empty strings, null and undefined.
            // We prefer not to send empty strings to the backend as they might violate date/int formats.
            if (value === null || value === undefined || value === '') {
                delete payload[key];
            }
        });
        
        // Finalize cell number
        payload.telefono_celular = fullCelular;

        // Ensure no insurance fields are sent (security against residual state)
        Object.keys(payload).forEach(key => {
            // Remove any insurance-related field but KEEP 'particularidad'
            if ((key.toLowerCase().includes('particular') && key !== 'particularidad') || 
                key.toLowerCase().includes('seguro')) {
                delete payload[key];
            }
        });
        try {
            let targetId = isEditing ? Number(id) : null;
            if (isEditing) {
                await api.patch(`/pacientes/${id}`, payload);
                await Swal.fire({ icon: 'success', title: 'Actualizado', timer: 1500, showConfirmButton: false });
                handleVolver();
            } else {
                const response = await api.post('/pacientes', payload);
                targetId = response.data.id;
                setNewPatientId(targetId);
                
                await Swal.fire({ 
                    icon: 'success', 
                    title: '¡Ficha Creada!', 
                    text: 'Proceda a la firma digital del paciente.',
                    timer: 2000, 
                    showConfirmButton: false 
                });
                
                // Open Signature Modal
                setShowSignatureModal(true);
            }

            // Removed Odontogram Saving - Moved to Clinical History
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Error al guardar' });
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen mb-20 font-sans text-gray-800 dark:text-gray-100">
            <div className="flex items-center justify-between mb-10 border-b pb-4 border-gray-200 dark:border-gray-700">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-4">
                        <span className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800">
                            <Users size={32} />
                        </span>
                        <div>
                            {isEditing ? 'Historia Clínica' : 'Nuevo Paciente'}
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                                {isEditing ? 'Edición de filiación y antecedentes médicos' : 'Registro integral de datos y antecedentes médicos'}
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
                    <div className="flex items-center mb-6 pb-2 border-b border-blue-500/20">
                        <User size={24} className="text-blue-600 mr-4" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">Filiación</h2>
                    </div>





                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Fecha Ingreso</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="date" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={handleChange} className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div className="md:col-span-2"></div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Paterno <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="paterno" value={formData.paterno} onChange={handleChange} required placeholder="Ej: Pérez" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Materno</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="materno" value={formData.materno} onChange={handleChange} placeholder="Ej: Gómez" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Nombres <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Juan" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Nacimiento <span className="text-red-500">*</span></label>
                            <div className="relative flex items-center gap-2">
                                <div className="relative flex-grow">
                                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                {formData.fecha_nacimiento && (
                                    <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-700 p-1 px-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 min-w-[50px]">
                                        <span className="text-[8px] font-black text-gray-400 uppercase">Edad</span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            {(() => {
                                                const birthDate = new Date(formData.fecha_nacimiento);
                                                const today = new Date();
                                                let age = today.getFullYear() - birthDate.getFullYear();
                                                const m = today.getMonth() - birthDate.getMonth();
                                                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                                                return age;
                                            })()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Género <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select name="genero" value={formData.genero} onChange={handleChange} required className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                                    <option value="">-- Seleccionar --</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">C.I.</label>
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="ci" value={formData.ci} onChange={handleChange} placeholder="Ej: 1234567" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Dirección</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Ej: Av. Principal #123" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Ocupación</label>
                            <div className="relative">
                                <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="ocupacion" value={formData.ocupacion} onChange={handleChange} placeholder="Ej: Estudiante" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Teléfono/Celular <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="py-2 px-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans text-sm"
                                >
                                    {countryCodes.map(c => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </select>
                                <div className="relative flex-1">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input 
                                        type="text" 
                                        value={localCelular} 
                                        onChange={(e) => setLocalCelular(e.target.value)} 
                                        required 
                                        placeholder="Ej: 70012345" 
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Ej: paciente@gmail.com" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- INFORMACION CLINICA Y TRATAMIENTO (Solo para Particulares o cuando no es Seguro) --- */}

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 animate-slide-up">
                        <div className="flex items-center mb-6 pb-2 border-b border-green-500/20">
                            <Activity size={24} className="text-green-600 mr-4" />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">Información Clínica y Consulta</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                                   <HelpCircle size={16} className="text-blue-500" /> Motivo de Consulta
                                </label>
                                <textarea 
                                    name="motivo_consulta" 
                                    value={formData.motivo_consulta} 
                                    onChange={handleChange} 
                                    rows={2} 
                                    placeholder="¿Por qué acude el paciente a consulta?" 
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none" 
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                                    Recomendado por
                                </label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        name="recomendado_por" 
                                        value={formData.recomendado_por} 
                                        onChange={handleChange} 
                                        placeholder="Nombre de quien recomendó" 
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>





                {/* --- ANTECEDENTES FAMILIARES --- */}

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-6 pb-2 border-b border-indigo-500/20">
                            <Users size={24} className="text-indigo-600 mr-4" />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">Familiares</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Abuelos</label>
                                <div className="relative">
                                    <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400  pointer-events-none" />
                                    <input type="text" name="ant_familiares_abuelos" value={formData.ant_familiares_abuelos} onChange={handleChange} placeholder="Ej: Diabetes, Hipertensión" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Padres</label>
                                <div className="relative">
                                    <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400  pointer-events-none" />
                                    <input type="text" name="ant_familiares_padres" value={formData.ant_familiares_padres} onChange={handleChange} placeholder="Ej: Saludables" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Hermanos</label>
                                <div className="relative">
                                    <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400  pointer-events-none" />
                                    <input type="text" name="ant_familiares_hermanos" value={formData.ant_familiares_hermanos} onChange={handleChange} placeholder="Ej: Ninguno" className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                        </div>
                    </div>



                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* --- PATOLOGICOS --- */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-red-50 dark:border-red-900/30">
                            <div className="flex items-center mb-6 pb-2 border-b border-red-500/20">
                                <Activity size={24} className="text-red-600 mr-4" />
                                <h2 className="text-lg font-bold uppercase">Patológicos</h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { id: 'ant_pat_tratamiento_medico', label: 'Tratamiento Médico', detailId: 'tratamiento_medico_detalle', placeholder: '¿Qué enfermedad?' },
                                    { id: 'ant_pat_hemorragias', label: 'Hemorragias' },
                                    { id: 'ant_pat_intervencion_quirurgica', label: 'Intervención Quirúrgica' },
                                    { id: 'ant_pat_reaccion_anestesia', label: 'Reacción Anestesia', detailId: 'reaccion_anestesia_detalle', placeholder: '¿Qué reacción?' },
                                    { id: 'ant_pat_toma_medicamentos', label: 'Medicamentos', detailId: 'medicamento_72h_detalle', placeholder: '¿Cuáles y dosis?' },
                                    { id: 'ant_pat_alteraciones_cicatrizacion', label: 'Cicatrización' },
                                    { id: 'ant_pat_alergias', label: 'Alergias', detailId: 'alergia_medicamento_detalle', placeholder: '¿A qué medicamento?' },
                                ].map((item: any) => (
                                    <div key={item.id} className="p-3 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100/50 dark:border-red-900/20 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.label}</span>
                                            <div className="flex gap-4">
                                                <label className="flex items-center cursor-pointer group">
                                                    <input type="radio" checked={formData[item.id as keyof typeof formData] === true} onChange={() => setFormData({ ...formData, [item.id]: true })} className="hidden peer" />
                                                    <div className="w-10 h-6 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center px-1 peer-checked:bg-red-500 transition-all after:w-4 after:h-4 after:bg-white after:rounded-full peer-checked:after:translate-x-4 shadow-inner"></div>
                                                    <span className="ml-2 text-xs font-black text-gray-400 peer-checked:text-red-500">SÍ</span>
                                                </label>
                                                <label className="flex items-center cursor-pointer group">
                                                    <input type="radio" checked={formData[item.id as keyof typeof formData] === false} onChange={() => setFormData({ ...formData, [item.id]: false })} className="hidden peer" />
                                                    <div className="w-10 h-6 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center px-1 peer-checked:bg-gray-400 transition-all after:w-4 after:h-4 after:bg-white after:rounded-full shadow-inner"></div>
                                                    <span className="ml-2 text-xs font-black text-gray-400 peer-checked:text-gray-500">NO</span>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        {item.detailId && formData[item.id as keyof typeof formData] === true && (
                                            <div className="relative animate-in fade-in slide-in-from-top-1">
                                                <Edit size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                                                <input 
                                                    type="text" 
                                                    name={item.detailId} 
                                                    value={formData[item.detailId as keyof typeof formData] as string} 
                                                    onChange={handleChange} 
                                                    placeholder={item.placeholder}
                                                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-4 focus:ring-red-500/10 transition-all font-medium" 
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="relative">
                                    <Plus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" name="ant_pat_otros" value={formData.ant_pat_otros} onChange={handleChange} placeholder="Otros antecedentes..." className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* --- NO PATOLOGICOS --- */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-emerald-50 dark:border-emerald-900/30">
                            <div className="flex items-center mb-6 pb-2 border-b border-emerald-500/20">
                                <Wind size={24} className="text-emerald-600 mr-4" />
                                <h2 className="text-lg font-bold uppercase">No Patológicos</h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { id: 'ant_no_pat_fuma', label: 'Fuma', detailId: 'fuma_cantidad', placeholder: '¿Cuánto?' },
                                    { id: 'ant_no_pat_bruxismo', label: 'Bruxismo' },
                                    { id: 'ant_no_pat_bebe', label: 'Bebe' },
                                    { id: 'ant_no_pat_succion_digital', label: 'Succión Digital' },
                                    { id: 'ant_no_pat_onicofagia', label: 'Onicofagia' },
                                    { id: 'ant_no_pat_mordisqueo_objetos', label: 'Mordisqueo Objetos' },
                                    { id: 'ant_no_pat_queilofagia', label: 'Queilofagia' },
                                ].map((item: any) => (
                                    <div key={item.id} className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.label}</span>
                                            <div className="flex gap-4">
                                                <label className="flex items-center cursor-pointer group">
                                                    <input type="radio" checked={formData[item.id as keyof typeof formData] === true} onChange={() => setFormData({ ...formData, [item.id]: true })} className="hidden peer" />
                                                    <div className="w-10 h-6 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center px-1 peer-checked:bg-emerald-500 transition-all after:w-4 after:h-4 after:bg-white after:rounded-full peer-checked:after:translate-x-4 shadow-inner"></div>
                                                    <span className="ml-2 text-xs font-black text-gray-400 peer-checked:text-emerald-500">SÍ</span>
                                                </label>
                                                <label className="flex items-center cursor-pointer group">
                                                    <input type="radio" checked={formData[item.id as keyof typeof formData] === false} onChange={() => setFormData({ ...formData, [item.id]: false })} className="hidden peer" />
                                                    <div className="w-10 h-6 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center px-1 peer-checked:bg-gray-400 transition-all after:w-4 after:h-4 after:bg-white after:rounded-full shadow-inner"></div>
                                                    <span className="ml-2 text-xs font-black text-gray-400 peer-checked:text-gray-500">NO</span>
                                                </label>
                                            </div>
                                        </div>

                                        {item.detailId && formData[item.id as keyof typeof formData] === true && (
                                            <div className="relative animate-in fade-in slide-in-from-top-1">
                                                <Edit size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                                                <input 
                                                    type="text" 
                                                    name={item.detailId} 
                                                    value={formData[item.detailId as keyof typeof formData] as string} 
                                                    onChange={handleChange} 
                                                    placeholder={item.placeholder}
                                                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" 
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="relative">
                                    <Plus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" name="ant_no_pat_otros" value={formData.ant_no_pat_otros} onChange={handleChange} placeholder="Otros hábitos..." className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>


                {/* --- OBSERVACIONES Y TUTOR --- */}

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-6 pb-2 border-b border-gray-500/20">
                            <Info size={24} className="text-gray-600 mr-4" />
                            <h2 className="text-xl font-bold uppercase">Observaciones y Tutor</h2>
                        </div>
                        <div className="relative mb-6">
                            <Info size={18} className="absolute left-3 top-4 text-gray-400 pointer-events-none" />
                            <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={3} placeholder="Observaciones generales..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="tutor_nombre" value={formData.tutor_nombre} onChange={handleChange} placeholder="Nombre Tutor" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="relative">
                                <Fingerprint size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input type="text" name="tutor_ci" value={formData.tutor_ci} onChange={handleChange} placeholder="C.I. Tutor" className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    </div>


                {/* --- ACCIONES --- */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 flex justify-center gap-6 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <button 
                        type="submit" 
                        className="px-10 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2 transform hover:-translate-y-1 transition-all shadow-lg active:scale-95"
                    >
                        <Save size={20} />
                        {isEditing ? 'Actualizar' : 'Guardar'}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleVolver} 
                        className="px-10 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-bold flex items-center gap-2 transform hover:-translate-y-1 transition-all shadow-lg active:scale-95"
                    >
                        <X size={20} />
                        Cancelar
                    </button>
                </div>
            </form>

            <SignatureModal 
                isOpen={showSignatureModal} 
                onClose={() => {
                    setShowSignatureModal(false);
                    handleVolver();
                }} 
                documentoId={id ? parseInt(id) : (newPatientId || 0)}
                tipoDocumento="paciente"
                rolFirmante="paciente"
            />


            <ManualModal
                isOpen={showManual}
                onClose={() => setShowManual(false)}
                title="Ayuda"
                sections={manualSections}
            />
        </div>
    );
};

export default PacienteForm;
