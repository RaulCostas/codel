import React, { useState, useEffect } from 'react';

import api from '../services/api';
import Swal from 'sweetalert2';
import SignatureCanvas from './SignatureCanvas';
import { CheckCircle } from 'lucide-react';



import { getLocalDateString } from '../utils/dateUtils';



const PublicPacienteForm: React.FC = () => {
    const isEditing = false;
    const [currentStep, setCurrentStep] = useState<'form' | 'signature' | 'success'>('form');
    const [newPatientId, setNewPatientId] = useState<number | null>(null);

    // Los formularios públicos son agnóticos a la sesión, no deben limpiarla preventivamente

    const [formData, setFormData] = useState({
        fecha_ingreso: getLocalDateString(),
        paterno: '',
        materno: '',
        nombre: '',
        direccion: '',
        telefono: '',
        telefono_celular: '',
        email: '',
        casilla: '',
        profesion: '',
        estado_civil: '',
        direccion_oficina: '',
        telefono_oficina: '',
        fecha_nacimiento: '',
        genero: '',
        seguro_medico: '',
        poliza: '',
        responsable: '',
        parentesco: '',
        direccion_responsable: '',
        telefono_responsable: '',
        ci: '',
        lugar_residencia: '',
        estado: 'activo',
        clasificacion: 'A0',
        // Flattened Medical History
        ultima_visita_odontologo: '',
        motivo_consulta: '',
        ant_no_pat_bruxismo: false,
        ant_pat_alergias: false,
        alergia_medicamento_detalle: '',
        ant_pat_toma_medicamentos: false,
        medicamento_72h_detalle: '',
        ant_pat_tratamiento_medico: false,
        tratamiento_medico_detalle: '',
        ant_pat_reaccion_anestesia: false,
        reaccion_anestesia_detalle: '',
        enf_neurologicas: false,
        enf_neurologicas_detalle: '',
        enf_pulmonares: false,
        enf_pulmonares_detalle: '',
        enf_cardiacas: false,
        enf_cardiacas_detalle: '',
        enf_higado: false,
        enf_higado_detalle: '',
        enf_gastricas: false,
        enf_gastricas_detalle: '',
        enf_venereas: false,
        enf_venereas_detalle: '',
        enf_renales: false,
        enf_renales_detalle: '',
        articulaciones: false,
        articulaciones_detalle: '',
        diabetes: false,
        diabetes_detalle: '',
        hipertension: false,
        hipotension: false,
        anemia: false,
        anemia_detalle: '',
        prueba_vih: false,
        prueba_vih_resultado: '',
        anticonceptivo_hormonal: false,
        anticonceptivo_hormonal_detalle: '',
        posibilidad_embarazo: false,
        semana_gestacion: '',
        cepillado_veces: '',
        usa_hilo_dental: false,
        usa_enjuague: false,
        ant_no_pat_fuma: false,
        fuma_cantidad: '',
        ant_no_pat_bebe: false, // Map consume_citricos or add it? I'll use consume_citricos
        consume_citricos: false,
        recomendado_por: '',
        observaciones: ''
    });

    // New state for phone country code
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

    

    

    // const [categorias, setCategorias] = useState<any[]>([]);

    // useEffect(() => {
    //     fetchCategorias();
    // }, []);

    // const fetchCategorias = async () => {
    //     try {
    //         const response = await api.get('/categoria-paciente?limit=100');
    //         const activeCategorias = (response.data.data || []).filter((cat: any) => cat.estado === 'activo');
    //         setCategorias(activeCategorias);
    //     } catch (error) {
    //         console.error('Error fetching categorias:', error);
    //     }
    // };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = { ...formData };
            Object.entries(payload).forEach(([key, value]) => {
                if (value === null || value === undefined || value === '') {
                    delete payload[key];
                }
            });
            
            payload.genero = formData.genero;
            payload.telefono_celular = `${countryCode}${localCelular}`;

            const response = await api.post('/pacientes', payload);
            const createdId = response.data.id;

            if (createdId) {
                setNewPatientId(createdId);
                setCurrentStep('signature');
                window.scrollTo(0, 0);
            } else {
                throw new Error("No se recibió el ID del paciente creado");
            }
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error guardando sus datos. Intente nuevamente.'
            });
        }
    };

    const handleSaveSignature = async (signatureData: string) => {
        if (!newPatientId) return;

        try {
            await api.post('/firmas', {
                tipoDocumento: 'paciente_particular',
                documentoId: newPatientId,
                rolFirmante: 'paciente',
                firmaData: signatureData,
                tipoFirma: 'dibujada',
                usuarioId: 1, // Default admin
                timestamp: new Date().toISOString()
            });

            setCurrentStep('success');
            window.scrollTo(0, 0);
        } catch (error: any) {
            console.error("Error salvando firma:", error);
            const errorMsg = error.response?.data?.message || 'No se pudo guardar la firma digital. Intente de nuevo.';
            Swal.fire({
                icon: 'error',
                title: 'Error al Guardar Firma',
                text: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)
            });
        }
    };


    if (currentStep === 'signature') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
                <div className="w-full max-w-[700px] mb-8">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
                            <span className="text-gray-400 font-medium line-through">Datos Personales</span>
                        </div>
                        <div className="h-px bg-blue-200 flex-1 mx-4"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                            <span className="text-blue-600 font-bold">Firma Digital</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Casi terminamos</h2>
                            <p className="text-gray-500 mt-2">Por favor, realice su firma digital para completar el registro legal de su ficha.</p>
                        </div>
                        
                        <SignatureCanvas 
                            onSave={handleSaveSignature} 
                            onCancel={() => setCurrentStep('form')} 
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
                <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-xl p-10 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">¡Registro Exitoso!</h2>
                    <p className="text-gray-600 text-lg mb-8">
                        Muchas gracias por completar su registro y firmar su ficha médica. <br/>
                        Ya puede pasar a sala de espera, lo llamaremos enseguida.
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg active:scale-95"
                    >
                        Finalizar
                    </button>
                    <p className="mt-6 text-sm text-gray-400">La página se reiniciará automáticamente para el siguiente paciente.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-[700px] bg-white rounded-xl shadow-lg p-6 md:p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">CLINICA DENTAL</h1>
                    <p className="text-gray-500">Formulario de Ingreso de Paciente Nuevo</p>
                </div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </span>
                    Registro de Paciente
                </h2>
                
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
                {/* Datos Personales */}
                 <fieldset className="border border-gray-300 p-4 rounded-lg">
                    <legend className="font-bold px-2 text-gray-600">Datos Personales</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Paterno:</label>
                             <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <input type="text" name="paterno" value={formData.paterno} onChange={handleChange} required placeholder="Ej: Pérez"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Materno:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <input type="text" name="materno" value={formData.materno} onChange={handleChange} required placeholder="Ej: Gómez"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Nombre:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Juan"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Fecha Nacimiento:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Sexo:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <select name="genero" value={formData.genero} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                                    <option value="" disabled>-- Seleccione --</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Estado Civil:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <select name="estado_civil" value={formData.estado_civil} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                                    <option value="" disabled>-- Seleccione --</option>
                                    <option value="Soltero">Soltero(a)</option>
                                    <option value="Casado">Casado(a)</option>
                                    <option value="Divorciado">Divorciado(a)</option>
                                    <option value="Viudo">Viudo(a)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Carnet de Identidad (CI):</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                </svg>
                                <input type="text" name="ci" value={formData.ci} onChange={handleChange} placeholder="Ej: 1234567"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                    </div>
                </fieldset>

                {/* Contacto */}
                 <fieldset className="border border-gray-300 p-4 rounded-lg mt-4">
                    <legend className="font-bold px-2 text-gray-600">Contacto</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                            <label className="block mb-1 font-medium text-gray-700">Dirección:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección completa..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                            <div>
                                 <label className="block mb-1 font-medium text-gray-700">Teléfono:</label>
                                <div className="relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                    <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej: 4-440000"
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1 font-medium text-gray-700">Celular:</label>
                                <div className="flex gap-2">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="py-2 px-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="" disabled>-- Seleccione --</option>
                                        {countryCodes.map(c => (
                                            <option key={c.code} value={c.code}>{c.label}</option>
                                        ))}
                                    </select>
                                    <div className="relative flex-1">
                                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                            <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                        </svg>
                                        <input
                                            type="text"
                                            name="localCelular"
                                            value={localCelular}
                                            onChange={(e) => setLocalCelular(e.target.value)}
                                            placeholder="Ej: 70012345"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                             <label className="block mb-1 font-medium text-gray-700">Email:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Ej: correo@ejemplo.com"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                         <div>
                            <label className="block mb-1 font-medium text-gray-700">Lugar de Residencia:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <input type="text" name="lugar_residencia" value={formData.lugar_residencia} onChange={handleChange} placeholder="Ej: Cochabamba"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Profesión:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                </svg>
                                <input type="text" name="profesion" value={formData.profesion} onChange={handleChange} placeholder="Ej: Arquitecto"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                    </div>
                </fieldset>



                {/* Responsable */}
                 <fieldset className="border border-gray-300 p-4 rounded-lg mt-4">
                    <legend className="font-bold px-2 text-gray-600">Responsable</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Nombre Responsable:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <input type="text" name="responsable" value={formData.responsable} onChange={handleChange} placeholder="Ej: María Gómez"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Parentesco:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <input type="text" name="parentesco" value={formData.parentesco} onChange={handleChange} placeholder="Ej: Madre"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Dirección Responsable:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <input type="text" name="direccion_responsable" value={formData.direccion_responsable} onChange={handleChange} placeholder="Dirección completa..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700">Teléfono Responsable:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                <input type="text" name="telefono_responsable" value={formData.telefono_responsable} onChange={handleChange} placeholder="Ej: 70012345"
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block"
                                />
                            </div>
                        </div>
                    </div>
                </fieldset>


                {/* Historial y Motivo de Consulta */}
                 <fieldset className="border border-gray-300 p-4 rounded-lg mt-4">
                    <legend className="font-bold px-2 text-gray-600">Consulta</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block mb-1 font-medium text-gray-700">¿Cúando fue la última vez que visitó al odontólogo, y cuál fue el motivo?</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3 text-gray-400">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <textarea name="ultima_visita_odontologo" value={formData.ultima_visita_odontologo} onChange={handleChange} className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Ej: Hace 6 meses..."></textarea>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block mb-1 font-medium text-gray-700">Motivo de consulta:</label>
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3 text-gray-400">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121(3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <textarea name="motivo_consulta" value={formData.motivo_consulta} onChange={handleChange} className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Ingrese una descripción..."></textarea>
                            </div>
                        </div>
                    </div>
                </fieldset>

                {/* Ficha Medica Title */}
                <div className="mt-8 mb-2 pb-2 border-b-2 border-blue-500">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Ficha Médica
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Llene el historial médico y cuestionario del paciente.</p>
                </div>
                <fieldset className="border border-gray-300 p-4 rounded-lg">
                    <legend className="font-bold px-2 text-gray-700">Antecedentes Patológicos Personales</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                            <input type="checkbox" name="ant_no_pat_bruxismo" checked={formData.ant_no_pat_bruxismo} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> ¿Tiene Bruxismo / Aprieta los dientes?
                        </label>
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="ant_pat_alergias" checked={formData.ant_pat_alergias} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> ¿Es Alérgico a algún medicamento?
                            </label>
                            {formData.ant_pat_alergias && (
                                <input type="text" name="alergia_medicamento_detalle" placeholder="Indique cuál" value={formData.alergia_medicamento_detalle} onChange={handleChange} className="w-full px-3 py-1 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="ant_pat_toma_medicamentos" checked={formData.ant_pat_toma_medicamentos} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> ¿Tomó algún medicamento en las últimas 72 horas?
                            </label>
                            {formData.ant_pat_toma_medicamentos && (
                                <input type="text" name="medicamento_72h_detalle" placeholder="Especifique medicamento y motivo" value={formData.medicamento_72h_detalle} onChange={handleChange} className="w-full px-3 py-1 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="ant_pat_tratamiento_medico" checked={formData.ant_pat_tratamiento_medico} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> ¿Se encuentra actualmente bajo Tratamiento Médico?
                            </label>
                            {formData.ant_pat_tratamiento_medico && (
                                <input type="text" name="tratamiento_medico_detalle" placeholder="¿Por qué motivo?" value={formData.tratamiento_medico_detalle} onChange={handleChange} className="w-full px-3 py-1 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            )}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                            <input type="checkbox" name="ant_pat_reaccion_anestesia" checked={formData.ant_pat_reaccion_anestesia} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> ¿Ha tenido reacciones a la Anestesia?
                        </label>
                        <div className="flex flex-col gap-1">
                            {formData.ant_pat_reaccion_anestesia && (
                                <input type="text" name="reaccion_anestesia_detalle" placeholder="Indique cuál" value={formData.reaccion_anestesia_detalle} onChange={handleChange} className="w-full px-3 py-1 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            )}
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border border-gray-300 p-4 rounded-lg mt-4">
                    <legend className="font-bold px-2 text-gray-700">Enfermedades</legend>
                    <p className="text-sm text-gray-600 mb-3">Marque y especifique si padece de alguna de las siguientes:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                        {/* Neurológicas */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="enf_neurologicas" checked={formData.enf_neurologicas} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Neurológicas
                            </label>
                            {formData.enf_neurologicas && (
                                <input type="text" name="enf_neurologicas_detalle" placeholder="Indique cuál" value={formData.enf_neurologicas_detalle} onChange={handleChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 bg-white" />
                            )}
                        </div>
                        {/* Pulmonares */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="enf_pulmonares" checked={formData.enf_pulmonares} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Pulmonares
                            </label>
                            {formData.enf_pulmonares && (
                                <input type="text" name="enf_pulmonares_detalle" placeholder="Indique cuál" value={formData.enf_pulmonares_detalle} onChange={handleChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 bg-white" />
                            )}
                        </div>
                        {/* Cardíacas */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="enf_cardiacas" checked={formData.enf_cardiacas} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Cardíacas
                            </label>
                            {formData.enf_cardiacas && (
                                <input type="text" name="enf_cardiacas_detalle" placeholder="Indique cuál" value={formData.enf_cardiacas_detalle} onChange={handleChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 bg-white" />
                            )}
                        </div>
                        {/* Hígado */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="enf_higado" checked={formData.enf_higado} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Del Hígado
                            </label>
                            {formData.enf_higado && (
                                <input type="text" name="enf_higado_detalle" placeholder="Indique cuál" value={formData.enf_higado_detalle} onChange={handleChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 bg-white" />
                            )}
                        </div>
                        {/* Gástricas */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="enf_gastricas" checked={formData.enf_gastricas} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Gástricas e Intestinales
                            </label>
                            {formData.enf_gastricas && (
                                <input type="text" name="enf_gastricas_detalle" placeholder="Indique cuál" value={formData.enf_gastricas_detalle} onChange={handleChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 bg-white" />
                            )}
                        </div>
                        {/* Venéreas */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="enf_venereas" checked={formData.enf_venereas} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Venéreas
                            </label>
                            {formData.enf_venereas && (
                                <input type="text" name="enf_venereas_detalle" placeholder="Indique cuál" value={formData.enf_venereas_detalle} onChange={handleChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 bg-white" />
                            )}
                        </div>
                        {/* Renales */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="enf_renales" checked={formData.enf_renales} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Renales
                            </label>
                            {formData.enf_renales && (
                                <input type="text" name="enf_renales_detalle" placeholder="Indique cuál" value={formData.enf_renales_detalle} onChange={handleChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 bg-white" />
                            )}
                        </div>
                        {/* Articulaciones */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="articulaciones" checked={formData.articulaciones} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> De las Articulaciones
                            </label>
                            {formData.articulaciones && (
                                <input type="text" name="articulaciones_detalle" placeholder="Indique cuál" value={formData.articulaciones_detalle} onChange={handleChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 bg-white" />
                            )}
                        </div>
                        {/* Diabetes */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="diabetes" checked={formData.diabetes} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Diabetes
                            </label>
                            {formData.diabetes && (
                                <input type="text" name="diabetes_detalle" placeholder="Indique qué tipo / tratamiento" value={formData.diabetes_detalle} onChange={handleChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 bg-white" />
                            )}
                        </div>
                        {/* Anemia */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="anemia" checked={formData.anemia} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Hemorragias / Anemia
                            </label>
                            {formData.anemia && (
                                <input type="text" name="anemia_detalle" placeholder="Indique cuál" value={formData.anemia_detalle} onChange={handleChange} className="w-full px-2 py-1 text-sm rounded border border-gray-300 bg-white" />
                            )}
                        </div>
                        {/* Presión Arterial */}
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="hipertension" checked={formData.hipertension} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Presión Alta (Hipertensión)
                            </label>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="hipotension" checked={formData.hipotension} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Presión Baja (Hipotensión)
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row items-baseline gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-bold">
                            <input type="checkbox" name="prueba_vih" checked={formData.prueba_vih} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> ¿Requirió o requiere Prueba de VIH?
                        </label>
                        {formData.prueba_vih && (
                            <select name="prueba_vih_resultado" value={formData.prueba_vih_resultado || ''} onChange={handleChange} className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white">
                                <option value="">-- Seleccione Resultado --</option>
                                <option value="Positivo">Positivo</option>
                                <option value="Negativo">Negativo</option>
                            </select>
                        )}
                    </div>
                </fieldset>

                <fieldset className="border border-gray-300 p-4 rounded-lg mt-4">
                    <legend className="font-bold px-2 text-gray-700">Antecedentes Gineco / Obstétricos</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="anticonceptivo_hormonal" checked={formData.anticonceptivo_hormonal} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> ¿Consume algún método Anticonceptivo Hormonal?
                            </label>
                            {formData.anticonceptivo_hormonal && (
                                <input type="text" name="anticonceptivo_hormonal_detalle" placeholder="Especifique cuál" value={formData.anticonceptivo_hormonal_detalle} onChange={handleChange} className="w-full px-3 py-1 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="posibilidad_embarazo" checked={formData.posibilidad_embarazo} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> ¿Existe la posibilidad de que esté embarazada?
                            </label>
                            {formData.posibilidad_embarazo && (
                                <input type="text" name="semana_gestacion" placeholder="Semanas de gestación (si aplica)" value={formData.semana_gestacion} onChange={handleChange} className="w-full px-3 py-1 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            )}
                        </div>
                    </div>
                </fieldset>

                <fieldset className="border border-gray-300 p-4 rounded-lg mt-4">
                    <legend className="font-bold px-2 text-gray-700">Hábitos</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700">¿Cuántas veces al día se cepilla los dientes?</label>
                            <input type="text" name="cepillado_veces" value={formData.cepillado_veces} onChange={handleChange} placeholder="Ej. 2 a 3 veces" className="w-full pr-3 py-2 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-700">¿Utiliza otros métodos de Higiene Bucal?</label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                    <input type="checkbox" name="usa_hilo_dental" checked={formData.usa_hilo_dental} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Hilo / Cinta Dental
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                    <input type="checkbox" name="usa_enjuague" checked={formData.usa_enjuague} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> Enjuague Bucal
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="ant_no_pat_fuma" checked={formData.ant_no_pat_fuma} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> ¿Fuma?
                            </label>
                            {formData.ant_no_pat_fuma && (
                                <input type="text" name="fuma_cantidad" placeholder="¿Cuántos cigarrillos al día?" value={formData.fuma_cantidad} onChange={handleChange} className="w-full px-3 py-1 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input type="checkbox" name="consume_citricos" checked={formData.consume_citricos} onChange={handleChange} className="accent-blue-500 w-4 h-4 cursor-pointer" /> ¿Consume cítricos frecuentemente?
                            </label>
                        </div>
                    </div>
                </fieldset>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 font-medium text-gray-700">Recomendado por (Opcional):</label>
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <input type="text" name="recomendado_por" value={formData.recomendado_por} onChange={handleChange} placeholder="Nombre de quien recomendó" className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block mb-2 font-medium text-gray-700">Observaciones Generales:</label>
                    <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} placeholder="Anotar cualquier observación vital que el Doctor deba saber..." className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>

                


                {/* Footer Buttons */}
                <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg text-lg w-full md:w-auto transition-transform hover:-translate-y-1 shadow-md">
        Enviar Datos y Completar Registro
    </button>
</div>
            </form>
            


        </div>
</div>
    );
};

export default PublicPacienteForm;
