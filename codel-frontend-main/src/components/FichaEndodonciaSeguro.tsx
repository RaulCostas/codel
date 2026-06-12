import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import type { FichaEndodonciaSeguro, EndodonciaPruebaVitalidad, EndodonciaControlTcr, EndodonciaMedicacion } from '../types';
import { Save, AlertCircle, Info, Stethoscope, Activity, Zap, FileText, Edit3, Plus, ArrowLeft, CheckSquare } from 'lucide-react';

interface FichaEndodonciaSeguroProps {
    pacienteSeguroId: number;
}

const FichaEndodonciaSeguroForm: React.FC<FichaEndodonciaSeguroProps> = ({ pacienteSeguroId }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [formData, setFormData] = useState<FichaEndodonciaSeguro>({
        pacienteSeguroId,
        clinico_caries_dental: false,
        clinico_fractura_coronal: false,
        clinico_decoloracion_pieza: false,
        clinico_movilidad_dental: false,
        clinico_exposicion_pulpar: false,
        clinico_restauracion_deficiente: false,
        clinico_lesion_furca: false,
        clinico_recesion_gingival: false,
        clinico_atrision: false,
        clinico_abracion: false,
        clinico_abfraccion: false,
        clinico_alteracion_desarrollo: false,
        radio_ligamento_ensanchado: false,
        radio_fractura_vertical: false,
        radio_fractura_horizontal: false,
        radio_apice_inmaduro: false,
        radio_caries_bajo_restauracion: false,
        radio_reabsorcion_externa: false,
        radio_reabsorcion_interna: false,
        radio_tcr_deficiente: false,
        radio_lesion_periapical: false,
        radio_lesion_lateral: false,
        radio_calcificacion_espacio: false,
        radio_perdida_osea: false,
        dolor_pres_ninguno_antes: false,
        dolor_pres_ninguno_ahora: false,
        dolor_pres_leve_antes: false,
        dolor_pres_leve_ahora: false,
        dolor_pres_moderado_antes: false,
        dolor_pres_moderado_ahora: false,
        dolor_pres_severo_antes: false,
        dolor_pres_severo_ahora: false,
        dolor_tipo_espontaneo_antes: false,
        dolor_tipo_espontaneo_ahora: false,
        dolor_tipo_estimulado_antes: false,
        dolor_tipo_estimulado_ahora: false,
        dolor_tipo_calor_antes: false,
        dolor_tipo_calor_ahora: false,
        dolor_tipo_frio_antes: false,
        dolor_tipo_frio_ahora: false,
        dolor_tipo_acidez_antes: false,
        dolor_tipo_acidez_ahora: false,
        dolor_tipo_dulce_antes: false,
        dolor_tipo_dulce_ahora: false,
        dolor_tipo_masticacion_antes: false,
        dolor_tipo_masticacion_ahora: false,
        dolor_tipo_constante_antes: false,
        dolor_tipo_constante_ahora: false,
        dolor_tipo_sordo_antes: false,
        dolor_tipo_sordo_ahora: false,
        dolor_tipo_palpitante_antes: false,
        dolor_tipo_palpitante_ahora: false,
        pulpar_sana: false,
        pulpar_reversible: false,
        pulpar_irreversible_sintomatica: false,
        pulpar_irreversible_asintomatica: false,
        pulpar_necrosis: false,
        pulpar_previamente_tratada: false,
        pulpar_tcr_sin_terminar: false,
        pulpar_conducto_no_sellado: false,
        peri_saludable: false,
        peri_apical_sintomatica: false,
        peri_apical_asintomatica: false,
        peri_absceso_agudo: false,
        peri_absceso_cronico: false,
        peri_osteitis_condensante: false,
        observaciones: '',
        diagnostico: '',
        tratamiento_check: false,
        tratamiento_descripcion: '',
        retratamiento_check: false,
        retratamiento_descripcion: '',
        pruebas_vitalidad: [
            { pieza: 'Pieza dentaria', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' },
            { pieza: 'Pieza de control', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' },
            { pieza: 'Pieza de control', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' }
        ],
        control_tcr: [
            { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
            { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
            { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
            { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' }
        ],
        medicacion_intraconducto: [],
        pieza_dental: ''
    });

    const [registeredPieces, setRegisteredPieces] = useState<FichaEndodonciaSeguro[]>([]);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            pacienteSeguroId,
            pieza_dental: '',
            clinico_caries_dental: false,
            clinico_fractura_coronal: false,
            clinico_decoloracion_pieza: false,
            clinico_movilidad_dental: false,
            clinico_exposicion_pulpar: false,
            clinico_restauracion_deficiente: false,
            clinico_lesion_furca: false,
            clinico_recesion_gingival: false,
            clinico_atrision: false,
            clinico_abracion: false,
            clinico_abfraccion: false,
            clinico_alteracion_desarrollo: false,
            radio_ligamento_ensanchado: false,
            radio_fractura_vertical: false,
            radio_fractura_horizontal: false,
            radio_apice_inmaduro: false,
            radio_caries_bajo_restauracion: false,
            radio_reabsorcion_externa: false,
            radio_reabsorcion_interna: false,
            radio_tcr_deficiente: false,
            radio_lesion_periapical: false,
            radio_lesion_lateral: false,
            radio_calcificacion_espacio: false,
            radio_perdida_osea: false,
            dolor_pres_ninguno_antes: false,
            dolor_pres_ninguno_ahora: false,
            dolor_pres_leve_antes: false,
            dolor_pres_leve_ahora: false,
            dolor_pres_moderado_antes: false,
            dolor_pres_moderado_ahora: false,
            dolor_pres_severo_antes: false,
            dolor_pres_severo_ahora: false,
            dolor_tipo_espontaneo_antes: false,
            dolor_tipo_espontaneo_ahora: false,
            dolor_tipo_estimulado_antes: false,
            dolor_tipo_estimulado_ahora: false,
            dolor_tipo_calor_antes: false,
            dolor_tipo_calor_ahora: false,
            dolor_tipo_frio_antes: false,
            dolor_tipo_frio_ahora: false,
            dolor_tipo_acidez_antes: false,
            dolor_tipo_acidez_ahora: false,
            dolor_tipo_dulce_antes: false,
            dolor_tipo_dulce_ahora: false,
            dolor_tipo_masticacion_antes: false,
            dolor_tipo_masticacion_ahora: false,
            dolor_tipo_constante_antes: false,
            dolor_tipo_constante_ahora: false,
            dolor_tipo_sordo_antes: false,
            dolor_tipo_sordo_ahora: false,
            dolor_tipo_palpitante_antes: false,
            dolor_tipo_palpitante_ahora: false,
            pulpar_sana: false,
            pulpar_reversible: false,
            pulpar_irreversible_sintomatica: false,
            pulpar_irreversible_asintomatica: false,
            pulpar_necrosis: false,
            pulpar_previamente_tratada: false,
            pulpar_tcr_sin_terminar: false,
            pulpar_conducto_no_sellado: false,
            peri_saludable: false,
            peri_apical_sintomatica: false,
            peri_apical_asintomatica: false,
            peri_absceso_agudo: false,
            peri_absceso_cronico: false,
            peri_osteitis_condensante: false,
            observaciones: '',
            diagnostico: '',
            tratamiento_check: false,
            tratamiento_descripcion: '',
            retratamiento_check: false,
            retratamiento_descripcion: '',
            pruebas_vitalidad: [
                { pieza: 'Pieza dentaria', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' },
                { pieza: 'Pieza de control', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' },
                { pieza: 'Pieza de control', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' }
            ],
            control_tcr: [
                { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' }
            ],
            medicacion_intraconducto: []
        }));
        setIsEditMode(true);
        setView('list');

        if (pacienteSeguroId > 0) {
            fetchRegisteredPieces();
        }
    }, [pacienteSeguroId]);

    const fetchRegisteredPieces = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/ficha-endodoncia-seguro/paciente/${pacienteSeguroId}/piezas`);
            setRegisteredPieces(response.data || []);
        } catch (error) {
            console.error('Error fetching registered pieces:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFicha = async (pieza: string) => {
        try {
            setLoading(true);
            const response = await api.get(`/ficha-endodoncia-seguro/paciente/${pacienteSeguroId}?pieza=${pieza}`);
            if (response.data) {
                const data = response.data;
                if (!data.pruebas_vitalidad?.length) {
                    data.pruebas_vitalidad = [
                        { pieza: 'Pieza dentaria', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' },
                        { pieza: 'Pieza de control', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' },
                        { pieza: 'Pieza de control', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' }
                    ];
                }
                if (!data.control_tcr?.length) {
                    data.control_tcr = [
                        { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                        { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                        { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                        { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' }
                    ];
                }
                setFormData(data);
                setIsEditMode(false);
            } else {
                setIsEditMode(true);
                setFormData(prev => ({
                    ...prev,
                    id: undefined,
                    pieza_dental: pieza,
                    clinico_caries_dental: false,
                    clinico_fractura_coronal: false,
                    clinico_decoloracion_pieza: false,
                    clinico_movilidad_dental: false,
                    clinico_exposicion_pulpar: false,
                    clinico_restauracion_deficiente: false,
                    clinico_lesion_furca: false,
                    clinico_recesion_gingival: false,
                    clinico_atrision: false,
                    clinico_abracion: false,
                    clinico_abfraccion: false,
                    clinico_alteracion_desarrollo: false,
                    radio_ligamento_ensanchado: false,
                    radio_fractura_vertical: false,
                    radio_fractura_horizontal: false,
                    radio_apice_inmaduro: false,
                    radio_caries_bajo_restauracion: false,
                    radio_reabsorcion_externa: false,
                    radio_reabsorcion_interna: false,
                    radio_tcr_deficiente: false,
                    radio_lesion_periapical: false,
                    radio_lesion_lateral: false,
                    radio_calcificacion_espacio: false,
                    radio_perdida_osea: false,
                    dolor_pres_ninguno_antes: false,
                    dolor_pres_ninguno_ahora: false,
                    dolor_pres_leve_antes: false,
                    dolor_pres_leve_ahora: false,
                    dolor_pres_moderado_antes: false,
                    dolor_pres_moderado_ahora: false,
                    dolor_pres_severo_antes: false,
                    dolor_pres_severo_ahora: false,
                    dolor_tipo_espontaneo_antes: false,
                    dolor_tipo_espontaneo_ahora: false,
                    dolor_tipo_estimulado_antes: false,
                    dolor_tipo_estimulado_ahora: false,
                    dolor_tipo_calor_antes: false,
                    dolor_tipo_calor_ahora: false,
                    dolor_tipo_frio_antes: false,
                    dolor_tipo_frio_ahora: false,
                    dolor_tipo_acidez_antes: false,
                    dolor_tipo_acidez_ahora: false,
                    dolor_tipo_dulce_antes: false,
                    dolor_tipo_dulce_ahora: false,
                    dolor_tipo_masticacion_antes: false,
                    dolor_tipo_masticacion_ahora: false,
                    dolor_tipo_constante_antes: false,
                    dolor_tipo_constante_ahora: false,
                    dolor_tipo_sordo_antes: false,
                    dolor_tipo_sordo_ahora: false,
                    dolor_tipo_palpitante_antes: false,
                    dolor_tipo_palpitante_ahora: false,
                    pulpar_sana: false,
                    pulpar_reversible: false,
                    pulpar_irreversible_sintomatica: false,
                    pulpar_irreversible_asintomatica: false,
                    pulpar_necrosis: false,
                    pulpar_previamente_tratada: false,
                    pulpar_tcr_sin_terminar: false,
                    pulpar_conducto_no_sellado: false,
                    peri_saludable: false,
                    peri_apical_sintomatica: false,
                    peri_apical_asintomatica: false,
                    peri_absceso_agudo: false,
                    peri_absceso_cronico: false,
                    peri_osteitis_condensante: false,
                    observaciones: '',
                    diagnostico: '',
                    tratamiento_check: false,
                    tratamiento_descripcion: '',
                    retratamiento_check: false,
                    retratamiento_descripcion: '',
                    pruebas_vitalidad: [
                        { pieza: 'Pieza dentaria', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' },
                        { pieza: 'Pieza de control', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' },
                        { pieza: 'Pieza de control', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' }
                    ],
                    control_tcr: [
                        { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                        { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                        { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                        { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' }
                    ],
                    medicacion_intraconducto: []
                }));
            }
        } catch (error: any) {
            if (error.response?.status !== 404) {
                console.error('Error fetching ficha endodoncia:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePieceChange = (pieza: string) => {
        setFormData(prev => ({ ...prev, pieza_dental: pieza }));
    };

    const openPiece = (pieza: string) => {
        setFormData(prev => ({ ...prev, pieza_dental: pieza }));
        fetchFicha(pieza);
        setView('form');
    };

    const openNewPiece = () => {
        setFormData(prev => ({
            ...prev,
            id: undefined,
            pieza_dental: '',
            clinico_caries_dental: false, clinico_fractura_coronal: false, clinico_decoloracion_pieza: false,
            clinico_movilidad_dental: false, clinico_exposicion_pulpar: false, clinico_restauracion_deficiente: false,
            clinico_lesion_furca: false, clinico_recesion_gingival: false, clinico_atrision: false,
            clinico_abracion: false, clinico_abfraccion: false, clinico_alteracion_desarrollo: false,
            radio_ligamento_ensanchado: false, radio_fractura_vertical: false, radio_fractura_horizontal: false,
            radio_apice_inmaduro: false, radio_caries_bajo_restauracion: false, radio_reabsorcion_externa: false,
            radio_reabsorcion_interna: false, radio_tcr_deficiente: false, radio_lesion_periapical: false,
            radio_lesion_lateral: false, radio_calcificacion_espacio: false, radio_perdida_osea: false,
            dolor_pres_ninguno_antes: false, dolor_pres_ninguno_ahora: false, dolor_pres_leve_antes: false,
            dolor_pres_leve_ahora: false, dolor_pres_moderado_antes: false, dolor_pres_moderado_ahora: false,
            dolor_pres_severo_antes: false, dolor_pres_severo_ahora: false,
            dolor_tipo_espontaneo_antes: false, dolor_tipo_espontaneo_ahora: false,
            dolor_tipo_estimulado_antes: false, dolor_tipo_estimulado_ahora: false,
            dolor_tipo_calor_antes: false, dolor_tipo_calor_ahora: false,
            dolor_tipo_frio_antes: false, dolor_tipo_frio_ahora: false,
            dolor_tipo_acidez_antes: false, dolor_tipo_acidez_ahora: false,
            dolor_tipo_dulce_antes: false, dolor_tipo_dulce_ahora: false,
            dolor_tipo_masticacion_antes: false, dolor_tipo_masticacion_ahora: false,
            dolor_tipo_constante_antes: false, dolor_tipo_constante_ahora: false,
            dolor_tipo_sordo_antes: false, dolor_tipo_sordo_ahora: false,
            dolor_tipo_palpitante_antes: false, dolor_tipo_palpitante_ahora: false,
            pulpar_sana: false, pulpar_reversible: false, pulpar_irreversible_sintomatica: false,
            pulpar_irreversible_asintomatica: false, pulpar_necrosis: false, pulpar_previamente_tratada: false,
            pulpar_tcr_sin_terminar: false, pulpar_conducto_no_sellado: false,
            peri_saludable: false, peri_apical_sintomatica: false, peri_apical_asintomatica: false,
            peri_absceso_agudo: false, peri_absceso_cronico: false, peri_osteitis_condensante: false,
            observaciones: '', diagnostico: '',
            tratamiento_check: false, tratamiento_descripcion: '',
            retratamiento_check: false, retratamiento_descripcion: '',
            pruebas_vitalidad: [
                { pieza: 'Pieza dentaria', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' },
                { pieza: 'Pieza de control', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' },
                { pieza: 'Pieza de control', frio: '', calor: '', electrica: '', percusion: '', palpacion: '', estado: '' }
            ],
            control_tcr: [
                { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' },
                { conductos_radiculares: '', punto_referencia: '', medida_provisional: '', medida_trabajo: '', lima_inicial: '', lima_maestra: '' }
            ],
            medicacion_intraconducto: []
        }));
        setIsEditMode(true);
        setLoading(false);
        setView('form');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayChange = (arrayName: 'pruebas_vitalidad' | 'control_tcr' | 'medicacion_intraconducto', index: number, field: string, value: string) => {
        setFormData(prev => {
            const newArray = [...(prev[arrayName] as any[]) || []];
            newArray[index] = { ...newArray[index], [field]: value };
            return { ...prev, [arrayName]: newArray };
        });
    };

    const addMedicacion = () => {
        setFormData(prev => ({
            ...prev,
            medicacion_intraconducto: [...(prev.medicacion_intraconducto || []), { fecha: '', medicacion: '' }]
        }));
    };

    const removeMedicacion = (index: number) => {
        setFormData(prev => {
            const newArray = [...(prev.medicacion_intraconducto || [])];
            newArray.splice(index, 1);
            return { ...prev, medicacion_intraconducto: newArray };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditMode) {
            setIsEditMode(true);
            return;
        }

        setSaving(true);
        try {
            await api.post('/ficha-endodoncia-seguro', formData);
            Swal.fire({
                icon: 'success',
                title: 'Ficha Guardada',
                text: 'La información se ha actualizado correctamente.',
                timer: 2000,
                showConfirmButton: false
            });
            setIsEditMode(false);
            await fetchRegisteredPieces();
            setView('list');
        } catch (error) {
            console.error('Error saving ficha endodoncia:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la información.'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading && view === 'form') {
        return (
            <div className="flex justify-center items-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (view === 'list') {
        return (
            <div className="space-y-6 pb-10 font-sans">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-red-700 to-rose-800 text-white flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <span className="p-2 bg-white/20 rounded-lg"><Stethoscope size={24} /></span>
                                FICHA DE ENDODONCIA - SEGURO
                            </h2>
                            <p className="mt-1 text-red-100/80 text-sm italic">Historial Clínico Dental de Seguro</p>
                        </div>
                        <button
                            onClick={openNewPiece}
                            className="flex items-center gap-2 bg-white text-red-700 hover:bg-red-50 px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md hover:-translate-y-0.5 transform"
                        >
                            <Plus size={18} />
                            Nueva Pieza
                        </button>
                    </div>

                    <div className="p-8">
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                            </div>
                        ) : registeredPieces.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl mb-4">
                                    <Stethoscope size={40} className="text-red-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">Sin piezas registradas</h3>
                                <p className="text-sm text-gray-400 mb-6">Este paciente no tiene fichas de endodoncia de seguro aún.</p>
                                <button
                                    onClick={openNewPiece}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-md transform hover:-translate-y-0.5"
                                >
                                    <Plus size={18} />
                                    Registrar Primera Pieza
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                                    {registeredPieces.length} pieza{registeredPieces.length !== 1 ? 's' : ''} registrada{registeredPieces.length !== 1 ? 's' : ''}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {registeredPieces.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => openPiece(p.pieza_dental || '')}
                                            className="group text-left p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-600 bg-white dark:bg-gray-800 hover:shadow-xl hover:shadow-red-100 dark:hover:shadow-none transition-all hover:-translate-y-1"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-none">
                                                    <span className="text-white font-black text-lg">{p.pieza_dental}</span>
                                                </div>
                                                <div className="p-2 bg-gray-100 dark:bg-gray-700 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 rounded-lg transition-colors">
                                                    <Edit3 size={14} className="text-gray-400 group-hover:text-red-500" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-wide">Pieza {p.pieza_dental}</p>
                                                {p.diagnostico && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.diagnostico}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    {p.tratamiento_check && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                                                            <CheckSquare size={10} /> Trat.
                                                        </span>
                                                    )}
                                                    {p.retratamiento_check && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                                                            <CheckSquare size={10} /> Re-Trat.
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const CheckboxItem = ({ label, name, checked }: { label: string, name: string, checked: boolean }) => (
        <label className={`flex items-center gap-3 p-3 rounded-xl border border-transparent ${!isEditMode ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer'} transition-all group`}>
            <div className="relative flex items-center justify-center">
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={`appearance-none h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600 checked:bg-red-600 checked:border-red-600 transition-all ${!isEditMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                />
                {checked && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white absolute pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-700 dark:group-hover:text-gray-400 transition-colors">
                {label}
            </span>
        </label>
    );

    const PainRow = ({ label, namePrefix }: { label: string, namePrefix: string }) => (
        <div className="grid grid-cols-3 items-center border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="p-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{label}</div>
            <div className="p-3 flex justify-center">
                <input
                    type="checkbox"
                    name={`${namePrefix}_antes`}
                    checked={(formData as any)[`${namePrefix}_antes`]}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={`h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600 checked:bg-red-600 ${!isEditMode ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                />
            </div>
            <div className="p-3 flex justify-center">
                <input
                    type="checkbox"
                    name={`${namePrefix}_ahora`}
                    checked={(formData as any)[`${namePrefix}_ahora`]}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={`h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600 checked:bg-red-600 ${!isEditMode ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                />
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-10 font-sans">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-red-700 to-rose-800 text-white flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span className="p-2 bg-white/20 rounded-lg"><Stethoscope size={24} /></span>
                            DIAGNÓSTICO Y TRATAMIENTO ENDODÓNTICO - SEGURO
                        </h2>
                        <p className="mt-1 text-red-100/80 text-sm flex items-center gap-2 italic">
                            <Info size={14} />
                            Ficha Clínica de Seguro
                            {formData.pieza_dental && <> &mdash; <strong>Pieza {formData.pieza_dental}</strong></>}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setView('list')}
                        className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </button>
                </div>

                <div className="p-8 space-y-10">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-none flex-shrink-0">
                            <span className="text-white font-black text-xl">{formData.pieza_dental || '?'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                                {formData.pieza_dental ? `Pieza ${formData.pieza_dental}` : 'Nueva Pieza'}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">Ficha Dental de Seguro</p>
                        </div>
                        {!formData.id && (
                            <div className="flex-shrink-0">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">N° Pieza</label>
                                <div className="relative">
                                    <Edit3 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="pieza_dental"
                                        value={formData.pieza_dental}
                                        onChange={(e) => handlePieceChange(e.target.value)}
                                        placeholder="Ej: 12"
                                        className="w-28 pl-9 pr-3 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:border-red-500 outline-none transition-all font-bold text-base"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-sm font-black text-red-700 dark:text-gray-400 flex items-center gap-2 uppercase tracking-widest border-b border-red-100 dark:border-red-900/30 pb-2">
                                <Activity size={18} />
                                1. Diagnóstico Clínico
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                                <CheckboxItem label="Caries dental" name="clinico_caries_dental" checked={formData.clinico_caries_dental} />
                                <CheckboxItem label="Fractura coronal" name="clinico_fractura_coronal" checked={formData.clinico_fractura_coronal} />
                                <CheckboxItem label="Decoloración de pieza" name="clinico_decoloracion_pieza" checked={formData.clinico_decoloracion_pieza} />
                                <CheckboxItem label="Movilidad dental" name="clinico_movilidad_dental" checked={formData.clinico_movilidad_dental} />
                                <CheckboxItem label="Exposición pulpar" name="clinico_exposicion_pulpar" checked={formData.clinico_exposicion_pulpar} />
                                <CheckboxItem label="Restauración deficiente" name="clinico_restauracion_deficiente" checked={formData.clinico_restauracion_deficiente} />
                                <CheckboxItem label="Lesión de furca" name="clinico_lesion_furca" checked={formData.clinico_lesion_furca} />
                                <CheckboxItem label="Recesión gingival" name="clinico_recesion_gingival" checked={formData.clinico_recesion_gingival} />
                                <CheckboxItem label="Atrisión" name="clinico_atrision" checked={formData.clinico_atrision} />
                                <CheckboxItem label="Abración" name="clinico_abracion" checked={formData.clinico_abracion} />
                                <CheckboxItem label="Abfracción" name="clinico_abfraccion" checked={formData.clinico_abfraccion} />
                                <CheckboxItem label="Alteración del desarrollo" name="clinico_alteracion_desarrollo" checked={formData.clinico_alteracion_desarrollo} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-black text-red-700 dark:text-gray-400 flex items-center gap-2 uppercase tracking-widest border-b border-red-100 dark:border-red-900/30 pb-2">
                                <Zap size={18} />
                                2. Diagnóstico Radiográfico
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                                <CheckboxItem label="Espacio ligamento ensanchado" name="radio_ligamento_ensanchado" checked={formData.radio_ligamento_ensanchado} />
                                <CheckboxItem label="Fractura radicular vertical" name="radio_fractura_vertical" checked={formData.radio_fractura_vertical} />
                                <CheckboxItem label="Fractura radicular horizontal" name="radio_fractura_horizontal" checked={formData.radio_fractura_horizontal} />
                                <CheckboxItem label="Ápice inmaduro" name="radio_apice_inmaduro" checked={formData.radio_apice_inmaduro} />
                                <CheckboxItem label="Caries dental bajo rest." name="radio_caries_bajo_restauracion" checked={formData.radio_caries_bajo_restauracion} />
                                <CheckboxItem label="Reabsorción externa" name="radio_reabsorcion_externa" checked={formData.radio_reabsorcion_externa} />
                                <CheckboxItem label="Reabsorción interna" name="radio_reabsorcion_interna" checked={formData.radio_reabsorcion_interna} />
                                <CheckboxItem label="TCR incompleto o deficiente" name="radio_tcr_deficiente" checked={formData.radio_tcr_deficiente} />
                                <CheckboxItem label="Lesión periapical" name="radio_lesion_periapical" checked={formData.radio_lesion_periapical} />
                                <CheckboxItem label="Lesión lateral" name="radio_lesion_lateral" checked={formData.radio_lesion_lateral} />
                                <CheckboxItem label="Calcificación espacio pulpar" name="radio_calcificacion_espacio" checked={formData.radio_calcificacion_espacio} />
                                <CheckboxItem label="Pérdida ósea" name="radio_perdida_osea" checked={formData.radio_perdida_osea} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-t border-gray-100 dark:border-gray-700 pt-8">
                        <div className="space-y-6">
                            <label className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                                3. Control de Dolor
                            </label>

                            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="grid grid-cols-3 bg-red-50/50 dark:bg-red-900/20 p-3 text-[10px] font-black uppercase tracking-tighter text-red-700 text-center">
                                    <div className="text-left pl-2">PRESENCIA DE DOLOR</div>
                                    <div>ANTES</div>
                                    <div>AHORA</div>
                                </div>
                                <div className="p-1">
                                    <PainRow label="NINGUNO" namePrefix="dolor_pres_ninguno" />
                                    <PainRow label="LEVE" namePrefix="dolor_pres_leve" />
                                    <PainRow label="MODERADO" namePrefix="dolor_pres_moderado" />
                                    <PainRow label="SEVERO" namePrefix="dolor_pres_severo" />
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800/80 p-3 text-[10px] font-black uppercase tracking-tighter text-gray-500 text-center">
                                    <div className="text-left pl-2">TIPO DE DOLOR</div>
                                    <div>ANTES</div>
                                    <div>AHORA</div>
                                </div>
                                <div className="p-1">
                                    <PainRow label="ESPONTÁNEO" namePrefix="dolor_tipo_espontaneo" />
                                    <PainRow label="ESTIMULADO" namePrefix="dolor_tipo_estimulado" />
                                    <PainRow label="AL CALOR" namePrefix="dolor_tipo_calor" />
                                    <PainRow label="AL FRÍO" namePrefix="dolor_tipo_frio" />
                                    <PainRow label="A LA ACIDEZ" namePrefix="dolor_tipo_acidez" />
                                    <PainRow label="AL DULCE" namePrefix="dolor_tipo_dulce" />
                                    <PainRow label="A LA MASTICACIÓN" namePrefix="dolor_tipo_masticacion" />
                                    <PainRow label="CONSTANTE" namePrefix="dolor_tipo_constante" />
                                    <PainRow label="SORDO" namePrefix="dolor_tipo_sordo" />
                                    <PainRow label="PALPITANTE" namePrefix="dolor_tipo_palpitante" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                                4. Diagnóstico Pulpar
                            </label>
                            <div className="flex flex-col gap-0.5">
                                <CheckboxItem label="Pulpa Sana" name="pulpar_sana" checked={formData.pulpar_sana} />
                                <CheckboxItem label="Pulpitis Reversible" name="pulpar_reversible" checked={formData.pulpar_reversible} />
                                <CheckboxItem label="Pulpitis Irreversible Sintomática" name="pulpar_irreversible_sintomatica" checked={formData.pulpar_irreversible_sintomatica} />
                                <CheckboxItem label="Pulpitis Irreversible Asintomática" name="pulpar_irreversible_asintomatica" checked={formData.pulpar_irreversible_asintomatica} />
                                <CheckboxItem label="Necrosis Pulpar" name="pulpar_necrosis" checked={formData.pulpar_necrosis} />
                                <CheckboxItem label="Previamente Tratado" name="pulpar_previamente_tratada" checked={formData.pulpar_previamente_tratada} />
                                <CheckboxItem label="TCR Iniciado (Sin Terminar)" name="pulpar_tcr_sin_terminar" checked={formData.pulpar_tcr_sin_terminar} />
                                <CheckboxItem label="Conducto No Sellado" name="pulpar_conducto_no_sellado" checked={formData.pulpar_conducto_no_sellado} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                                5. Diagnóstico Periapical
                            </label>
                            <div className="flex flex-col gap-0.5">
                                <CheckboxItem label="Tejidos Apicales Normales" name="peri_saludable" checked={formData.peri_saludable} />
                                <CheckboxItem label="Periodontitis Apical Sintomática" name="peri_apical_sintomatica" checked={formData.peri_apical_sintomatica} />
                                <CheckboxItem label="Periodontitis Apical Asintomática" name="peri_apical_asintomatica" checked={formData.peri_apical_asintomatica} />
                                <CheckboxItem label="Absceso Apical Agudo" name="peri_absceso_agudo" checked={formData.peri_absceso_agudo} />
                                <CheckboxItem label="Absceso Apical Crónico" name="peri_absceso_cronico" checked={formData.peri_absceso_cronico} />
                                <CheckboxItem label="Osteítis Condensante" name="peri_osteitis_condensante" checked={formData.peri_osteitis_condensante} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                        <div className="space-y-3">
                            <label className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                                Pruebas de Vitalidad Pulpar
                            </label>
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-left text-xs bg-white dark:bg-gray-800">
                                    <thead className="bg-gray-50 dark:bg-gray-900/80 text-[10px] uppercase font-black text-gray-500 tracking-wider">
                                        <tr>
                                            <th className="p-3">Pieza</th>
                                            <th className="p-3">Frío</th>
                                            <th className="p-3">Calor</th>
                                            <th className="p-3">Eléctrica</th>
                                            <th className="p-3">Percusión</th>
                                            <th className="p-3">Palpación</th>
                                            <th className="p-3">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {formData.pruebas_vitalidad?.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-750">
                                                <td className="p-2 font-bold whitespace-nowrap text-gray-600 dark:text-gray-300">{row.pieza}</td>
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.frio || ''} onChange={(e) => handleArrayChange('pruebas_vitalidad', idx, 'frio', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.calor || ''} onChange={(e) => handleArrayChange('pruebas_vitalidad', idx, 'calor', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.electrica || ''} onChange={(e) => handleArrayChange('pruebas_vitalidad', idx, 'electrica', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.percusion || ''} onChange={(e) => handleArrayChange('pruebas_vitalidad', idx, 'percusion', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.palpacion || ''} onChange={(e) => handleArrayChange('pruebas_vitalidad', idx, 'palpacion', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.estado || ''} onChange={(e) => handleArrayChange('pruebas_vitalidad', idx, 'estado', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Diagnóstico</label>
                                <input
                                    type="text"
                                    name="diagnostico"
                                    value={formData.diagnostico || ''}
                                    onChange={handleChange}
                                    disabled={!isEditMode}
                                    placeholder="Ej: Pulpitis irreversible..."
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="tratamiento_check"
                                        name="tratamiento_check"
                                        checked={formData.tratamiento_check || false}
                                        onChange={handleChange}
                                        disabled={!isEditMode}
                                        className="h-4 w-4 rounded border-2 border-gray-300 dark:border-gray-600 checked:bg-red-600 checked:border-red-600 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <label htmlFor="tratamiento_check" className="text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer">Tratamiento</label>
                                </div>
                                <input
                                    type="text"
                                    name="tratamiento_descripcion"
                                    value={formData.tratamiento_descripcion || ''}
                                    onChange={handleChange}
                                    disabled={!isEditMode}
                                    placeholder="Descripción del tratamiento..."
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="retratamiento_check"
                                        name="retratamiento_check"
                                        checked={formData.retratamiento_check || false}
                                        onChange={handleChange}
                                        disabled={!isEditMode}
                                        className="h-4 w-4 rounded border-2 border-gray-300 dark:border-gray-600 checked:bg-red-600 checked:border-red-600 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <label htmlFor="retratamiento_check" className="text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer">Re-Tratamiento</label>
                                </div>
                                <input
                                    type="text"
                                    name="retratamiento_descripcion"
                                    value={formData.retratamiento_descripcion || ''}
                                    onChange={handleChange}
                                    disabled={!isEditMode}
                                    placeholder="Descripción del re-tratamiento..."
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2">
                                Control del TCR
                            </label>
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-left text-xs bg-white dark:bg-gray-800">
                                    <thead className="bg-gray-50 dark:bg-gray-900/80 text-[10px] uppercase font-black text-gray-500 tracking-wider">
                                        <tr>
                                            <th className="p-3">Conductos Radiculares</th>
                                            <th className="p-3">Punto de Referencia</th>
                                            <th className="p-3">Medida Provisional</th>
                                            <th className="p-3">Medida de Trabajo</th>
                                            <th className="p-3">Lima Inicial</th>
                                            <th className="p-3">Lima Maestra</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {formData.control_tcr?.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-750">
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.conductos_radiculares || ''} onChange={(e) => handleArrayChange('control_tcr', idx, 'conductos_radiculares', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.punto_referencia || ''} onChange={(e) => handleArrayChange('control_tcr', idx, 'punto_referencia', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.medida_provisional || ''} onChange={(e) => handleArrayChange('control_tcr', idx, 'medida_provisional', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.medida_trabajo || ''} onChange={(e) => handleArrayChange('control_tcr', idx, 'medida_trabajo', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.lima_inicial || ''} onChange={(e) => handleArrayChange('control_tcr', idx, 'lima_inicial', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                                <td className="p-2"><input type="text" disabled={!isEditMode} value={row.lima_maestra || ''} onChange={(e) => handleArrayChange('control_tcr', idx, 'lima_maestra', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Medicación Intraconducto</label>
                                    {isEditMode && (
                                        <button type="button" onClick={addMedicacion} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-1.5 px-3 rounded-lg text-xs border border-gray-300 dark:border-gray-600 transition-all">
                                            + Fila
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-left text-xs bg-white dark:bg-gray-800">
                                        <thead className="bg-gray-50 dark:bg-gray-900/80 text-[10px] uppercase font-black text-gray-500 tracking-wider">
                                            <tr>
                                                <th className="p-3 w-1/3">Fecha</th>
                                                <th className="p-3">Medicación</th>
                                                {isEditMode && <th className="p-3 w-10"></th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {(!formData.medicacion_intraconducto || formData.medicacion_intraconducto.length === 0) && (
                                                <tr><td colSpan={isEditMode ? 3 : 2} className="p-4 text-center text-gray-400 italic">Sin medicación registrada</td></tr>
                                            )}
                                            {formData.medicacion_intraconducto?.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-750">
                                                    <td className="p-2"><input type="date" disabled={!isEditMode} value={row.fecha || ''} onChange={(e) => handleArrayChange('medicacion_intraconducto', idx, 'fecha', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60 text-xs" /></td>
                                                    <td className="p-2"><input type="text" disabled={!isEditMode} value={row.medicacion || ''} onChange={(e) => handleArrayChange('medicacion_intraconducto', idx, 'medicacion', e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-transparent disabled:opacity-60" placeholder="Ej: Hidróxido de calcio" /></td>
                                                    {isEditMode && (
                                                        <td className="p-2 text-center">
                                                            <button type="button" onClick={() => removeMedicacion(idx)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 font-bold text-sm transition-colors border border-red-200 dark:border-red-800">✕</button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Observaciones Generales</label>
                                <div className="relative h-full">
                                    <div className="absolute top-3 left-3 text-gray-400">
                                        <FileText size={16} />
                                    </div>
                                    <textarea
                                        name="observaciones" value={formData.observaciones} onChange={handleChange} disabled={!isEditMode}
                                        className="w-full h-[150px] pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none text-sm disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800"
                                        placeholder="Ej: Paciente asintomático, se programa obturación..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500">
                        <AlertCircle size={20} />
                        <span className="text-[10px] font-bold uppercase">Registro clínico bajo responsabilidad del especialista.</span>
                    </div>
                    <button
                        type="submit" disabled={saving}
                        className={`flex items-center gap-2 font-bold py-2 px-6 rounded-lg transform hover:-translate-y-0.5 transition-all shadow-md text-white ${
                            saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {saving ? (
                            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Guardando...</>
                        ) : !isEditMode ? (
                            <><Edit3 size={20} /> ACTUALIZAR FICHA DE ENDODONCIA</>
                        ) : (
                            <><Save size={20} /> {formData.id ? 'GUARDAR CAMBIOS DE FICHA DE ENDODONCIA' : 'GUARDAR FICHA DE ENDODONCIA'}</>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default FichaEndodonciaSeguroForm;
