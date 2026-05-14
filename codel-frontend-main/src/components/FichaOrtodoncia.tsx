import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import type { FichaOrtodoncia } from '../types';
import { Save, AlertCircle, Info, Activity, FileText, Clock, Edit3, Stethoscope, Layers, Plus, Clipboard } from 'lucide-react';

interface FichaOrtodonciaProps {
    pacienteId: number;
    proformaId: number;
    proformaNumero?: number;
}

const FichaOrtodonciaForm: React.FC<FichaOrtodonciaProps> = ({ pacienteId, proformaId, proformaNumero }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);
    const [formData, setFormData] = useState<FichaOrtodoncia>({
        pacienteId,
        proformaId,
        diagnostico: '',
        ortodoncia_superior: false,
        ortodoncia_inferior: false,
        ortodoncia_bimaxilar: false,
        ortopedia: false,
        ap_ortodontico_ortopedico: false,
        ap_descripcion: '',
        bandas_superior: false,
        bandas_inferior: false,
        bandas_ambos: false,
        tubos_superior: false,
        tubos_inferior: false,
        tubos_ambos: false,
        brackets_conv_metalicos: false,
        brackets_conv_esteticos: false,
        brackets_conv_combinados: false,
        brackets_auto_metalicos: false,
        brackets_auto_esteticos: false,
        brackets_auto_combinados: false,
        alineadores_superior: false,
        alineadores_inferior: false,
        alineadores_ambos: false,
        atp: false,
        arco_lingual: false,
        mascara_traccion_frontal: false,
        disyuntor_palatino_hirax: false,
        componentes_otros: false,
        componentes_otros_texto: '',
        identificador_levantamiento_mordida: false,
        levantamiento_tipo: '',
        exodoncia_ortodoncia: false,
        exodoncia_piezas: '',
        tiempo_aproximado: '',
        otros: '',
        observaciones: ''
    });

    useEffect(() => {
        // Reset form when plan changes
        setFormData({
            pacienteId,
            proformaId,
            diagnostico: '',
            ortodoncia_superior: false,
            ortodoncia_inferior: false,
            ortodoncia_bimaxilar: false,
            ortopedia: false,
            ap_ortodontico_ortopedico: false,
            ap_descripcion: '',
            bandas_superior: false,
            bandas_inferior: false,
            bandas_ambos: false,
            tubos_superior: false,
            tubos_inferior: false,
            tubos_ambos: false,
            brackets_conv_metalicos: false,
            brackets_conv_esteticos: false,
            brackets_conv_combinados: false,
            brackets_auto_metalicos: false,
            brackets_auto_esteticos: false,
            brackets_auto_combinados: false,
            alineadores_superior: false,
            alineadores_inferior: false,
            alineadores_ambos: false,
            atp: false,
            arco_lingual: false,
            mascara_traccion_frontal: false,
            disyuntor_palatino_hirax: false,
            componentes_otros: false,
            componentes_otros_texto: '',
            identificador_levantamiento_mordida: false,
            levantamiento_tipo: '',
            exodoncia_ortodoncia: false,
            exodoncia_piezas: '',
            tiempo_aproximado: '',
            otros: '',
            observaciones: ''
        });
        setIsEditMode(true);

        if (proformaId > 0) {
            fetchFicha();
        } else {
            setLoading(false);
        }
    }, [proformaId, pacienteId]);

    const fetchFicha = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ficha-ortodoncia/proforma/${proformaId}`);
            if (response.data) {
                setFormData(response.data);
                setIsEditMode(false);
            }
        } catch (error: any) {
            if (error.response?.status !== 404) {
                console.error('Error fetching ficha ortodoncia:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isEditMode) {
            setIsEditMode(true);
            return;
        }

        setSaving(true);
        try {
            await api.post('/ficha-ortodoncia', formData);
            Swal.fire({
                icon: 'success',
                title: 'Ficha Guardada',
                text: 'La información se ha actualizado correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
            setIsEditMode(false);
            fetchFicha();
        } catch (error) {
            console.error('Error saving ficha ortodoncia:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la información.'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const CheckboxItem = ({ label, name, checked }: { label: string, name: string, checked: boolean }) => (
        <label className={`flex items-center gap-3 p-3 rounded-xl border border-transparent ${!isEditMode ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'} transition-all group`}>
            <div className="relative flex items-center justify-center">
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={`appearance-none h-6 w-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 checked:bg-blue-600 checked:border-blue-600 transition-all ${!isEditMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                />
                {checked && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white absolute pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-gray-400 transition-colors">
                {label}
            </span>
        </label>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-10 font-sans">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300">
                {/* Header Section */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="p-2 bg-white/20 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                        </span>
                        DIAGNÓSTICO Y PLAN DE TRATAMIENTO - ORTODONCIA
                    </h2>
                    <p className="mt-2 text-blue-100/80 text-sm flex items-center gap-2 italic">
                        <Info size={14} />
                        Este formulario está vinculado al Plan de Tratamiento #{proformaNumero || proformaId}.
                    </p>
                </div>

                <div className="p-8 space-y-10">
                    {/* Diagnóstico Section */}
                        <div className="relative">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest block mb-2">Diagnóstico</label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 text-gray-400">
                                    <Clipboard size={18} />
                                </div>
                                <textarea
                                    name="diagnostico"
                                    value={formData.diagnostico}
                                    onChange={handleChange}
                                    disabled={!isEditMode}
                                    rows={4}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                                    placeholder="Ej: Maloclusión Clase II, apiñamiento moderado en el sector anterior superior..."
                                ></textarea>
                            </div>
                        </div>

                    {/* Main Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Ortodoncia / Ortopedia */}
                        <div className="space-y-6">
                            <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
                                <h4 className="font-bold text-blue-700 dark:text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                                    Tipo de Tratamiento
                                </h4>
                                <div className="space-y-1">
                                    <CheckboxItem label="Ortodoncia Superior" name="ortodoncia_superior" checked={formData.ortodoncia_superior} />
                                    <CheckboxItem label="Ortodoncia Inferior" name="ortodoncia_inferior" checked={formData.ortodoncia_inferior} />
                                    <CheckboxItem label="Ortodoncia Bimaxilar" name="ortodoncia_bimaxilar" checked={formData.ortodoncia_bimaxilar} />
                                    <hr className="my-2 border-blue-100 dark:border-blue-900/40" />
                                    <CheckboxItem label="Ortopedia" name="ortopedia" checked={formData.ortopedia} />
                                </div>
                            </div>

                            <div className="p-6 bg-purple-50/30 dark:bg-purple-900/10 rounded-2xl border border-purple-100/50 dark:border-purple-800/30">
                                <h4 className="font-bold text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                                    Banda / Tubos
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase mt-2 mb-1">Bandas</p>
                                    <CheckboxItem label="Superior" name="bandas_superior" checked={formData.bandas_superior} />
                                    <CheckboxItem label="Inferior" name="bandas_inferior" checked={formData.bandas_inferior} />
                                    <CheckboxItem label="Ambos" name="bandas_ambos" checked={formData.bandas_ambos} />
                                    <hr className="my-2 border-purple-100 dark:border-purple-900/40" />
                                    <p className="text-xs font-bold text-gray-500 uppercase mt-2 mb-1">Tubos</p>
                                    <CheckboxItem label="Superior" name="tubos_superior" checked={formData.tubos_superior} />
                                    <CheckboxItem label="Inferior" name="tubos_inferior" checked={formData.tubos_inferior} />
                                    <CheckboxItem label="Ambos" name="tubos_ambos" checked={formData.tubos_ambos} />
                                </div>
                            </div>
                        </div>

                        {/* Brackets */}
                        <div className="p-6 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30 h-full">
                            <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                                Especificación de Brackets
                            </h4>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-500 uppercase mt-2 mb-1">Convencional</p>
                                <CheckboxItem label="Metálicos" name="brackets_conv_metalicos" checked={formData.brackets_conv_metalicos} />
                                <CheckboxItem label="Estéticos" name="brackets_conv_esteticos" checked={formData.brackets_conv_esteticos} />
                                <CheckboxItem label="Combinados" name="brackets_conv_combinados" checked={formData.brackets_conv_combinados} />
                                
                                <hr className="my-2 border-indigo-100 dark:border-indigo-900/40" />
                                <p className="text-xs font-bold text-gray-500 uppercase mt-2 mb-1">Autoligado</p>
                                <CheckboxItem label="Metálicos" name="brackets_auto_metalicos" checked={formData.brackets_auto_metalicos} />
                                <CheckboxItem label="Estéticos" name="brackets_auto_esteticos" checked={formData.brackets_auto_esteticos} />
                                <CheckboxItem label="Combinados" name="brackets_auto_combinados" checked={formData.brackets_auto_combinados} />
                                
                                <hr className="my-2 border-indigo-100 dark:border-indigo-900/40" />
                                <p className="text-xs font-bold text-gray-500 uppercase mt-2 mb-1">Alineadores</p>
                                <CheckboxItem label="Superior" name="alineadores_superior" checked={formData.alineadores_superior} />
                                <CheckboxItem label="Inferior" name="alineadores_inferior" checked={formData.alineadores_inferior} />
                                <CheckboxItem label="Ambos" name="alineadores_ambos" checked={formData.alineadores_ambos} />
                            </div>
                        </div>

                        {/* Additional Components */}
                        <div className="p-6 bg-gray-50/50 dark:bg-gray-700/20 rounded-2xl border border-gray-200 dark:border-gray-600/50">
                            <h4 className="font-bold text-gray-700 dark:text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                                Componentes Adicionales
                            </h4>
                            <div className="space-y-1">
                                <CheckboxItem label="ATP" name="atp" checked={formData.atp} />
                                <CheckboxItem label="Arco Lingual" name="arco_lingual" checked={formData.arco_lingual} />
                                <CheckboxItem label="Máscara Tracción Frontal" name="mascara_traccion_frontal" checked={formData.mascara_traccion_frontal} />
                                <CheckboxItem label="Disyuntor Hirax" name="disyuntor_palatino_hirax" checked={formData.disyuntor_palatino_hirax} />
                                <hr className="my-2 border-gray-200 dark:border-gray-600/50" />
                                <CheckboxItem label="Otros" name="componentes_otros" checked={formData.componentes_otros} />
                                {formData.componentes_otros && (
                                    <div className="mt-2 pl-2">
                                        <input
                                            type="text"
                                            name="componentes_otros_texto"
                                            value={formData.componentes_otros_texto || ''}
                                            onChange={handleChange}
                                            disabled={!isEditMode}
                                            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                                            placeholder="Especifique otros componentes..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Specific Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                        {/* Aparato Detail */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <CheckboxItem label="AP. ORTODÓNTICO / ORTOPÉDICO" name="ap_ortodontico_ortopedico" checked={formData.ap_ortodontico_ortopedico} />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Edit3 size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="ap_descripcion"
                                    value={formData.ap_descripcion}
                                    onChange={handleChange}
                                    disabled={!formData.ap_ortodontico_ortopedico || !isEditMode}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                                    placeholder="Ej: Expansor palatino, placa de Hawley..."
                                />
                            </div>
                        </div>

                        {/* Levantamiento Detail */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <CheckboxItem label="LEVANTAMIENTO DE MORDIDA" name="identificador_levantamiento_mordida" checked={formData.identificador_levantamiento_mordida} />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Plus size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="levantamiento_tipo"
                                    value={formData.levantamiento_tipo}
                                    onChange={handleChange}
                                    disabled={!formData.identificador_levantamiento_mordida || !isEditMode}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                                    placeholder="Ej: Bloques de resina en molares..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Exodoncia Section */}
                    <div className="bg-orange-50/30 dark:bg-orange-900/10 p-6 rounded-2xl border border-orange-100/50 dark:border-orange-800/30 space-y-4">
                        <CheckboxItem label="EXODONCIA PARA ORTODONCIA" name="exodoncia_ortodoncia" checked={formData.exodoncia_ortodoncia} />
                        {formData.exodoncia_ortodoncia && (
                            <div className="pl-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Piezas Dentarias:</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Activity size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="exodoncia_piezas"
                                        value={formData.exodoncia_piezas || ''}
                                        onChange={handleChange}
                                        disabled={!isEditMode}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                                        placeholder="Ej: 14, 24, 34, 44"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tiempos and Observations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Tiempo Aprox. de Tratamiento</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Clock size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="tiempo_aproximado"
                                    value={formData.tiempo_aproximado}
                                    onChange={handleChange}
                                    disabled={!isEditMode}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                                    placeholder="Ej: 18 - 24 meses"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Otros Detalles</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Plus size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="otros"
                                    value={formData.otros}
                                    onChange={handleChange}
                                    disabled={!isEditMode}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                                    placeholder="Ej: Uso de elásticos intermaxilares..."
                                />
                            </div>
                        </div>
                        <div className="col-span-full space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">Observaciones Generales</label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 text-gray-400">
                                    <FileText size={18} />
                                </div>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    disabled={!isEditMode}
                                    rows={3}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                                    placeholder="Ej: Paciente colaborador, requiere refuerzo en higiene..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-6 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                        <AlertCircle size={20} />
                        <span className="text-xs font-semibold">Toda modificación será guardada permanentemente.</span>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className={`flex items-center gap-2 font-bold py-2 px-6 rounded-lg transform hover:-translate-y-0.5 transition-all shadow-md text-white ${
                            saving 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Guardando...
                            </>
                        ) : !isEditMode ? (
                            <>
                                <Edit3 size={20} />
                                ACTUALIZAR FICHA DE ORTODONCIA
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                {formData.id ? 'GUARDAR CAMBIOS DE FICHA DE ORTODONCIA' : 'GUARDAR FICHA DE ORTODONCIA'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default FichaOrtodonciaForm;
