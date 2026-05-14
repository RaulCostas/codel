import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';
import type { ArancelSeguro, Especialidad, Seguro } from '../types';
import EspecialidadForm from './EspecialidadForm';
import { Tag, FileText, DollarSign, Save, X, Hash, Layers, ShieldCheck, Plus, ClipboardList } from 'lucide-react';

interface ArancelSeguroFormProps {
    isOpen: boolean;
    onClose: () => void;
    id?: number | null;
    seguroId?: number | null;
    onSaveSuccess: () => void;
}

const ArancelSeguroForm: React.FC<ArancelSeguroFormProps> = ({ isOpen, onClose, id, seguroId, onSaveSuccess }) => {
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        codigo: '',
        detalle: '',
        precio: '' as string | number,
        moneda: 'Bolivianos',
        estado: 'activo',
        idEspecialidad: 0,
        seguroId: seguroId || 0
    });
    
    const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
    const [seguros, setSeguros] = useState<Seguro[]>([]);
    const [isEspecialidadModalOpen, setIsEspecialidadModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchEspecialidades();
            fetchSeguros();
            if (isEditMode) {
                api.get<ArancelSeguro>(`/arancel-seguro/${id}`)
                    .then(response => {
                        setFormData({
                            codigo: response.data.codigo || '',
                            detalle: response.data.detalle,
                            precio: response.data.precio.toString(),
                            moneda: response.data.moneda || 'Bolivianos',
                            estado: response.data.estado,
                            idEspecialidad: Number(response.data.idEspecialidad),
                            seguroId: Number(response.data.seguroId)
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching arancel seguro:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error al cargar el arancel de seguro'
                        });
                    });
            } else {
                setFormData({
                    codigo: '',
                    detalle: '',
                    precio: '',
                    moneda: 'Bolivianos',
                    estado: 'activo',
                    idEspecialidad: 0,
                    seguroId: seguroId || 0
                });
            }
        }
    }, [id, isEditMode, isOpen, seguroId]);

    const fetchEspecialidades = async () => {
        try {
            const response = await api.get<{ data: Especialidad[] }>('/especialidad?limit=100');
            setEspecialidades(response.data.data);
        } catch (error) {
            console.error('Error fetching especialidades:', error);
        }
    };

    const fetchSeguros = async () => {
        try {
            const response = await api.get<{ data: Seguro[] }>('/seguro?limit=100');
            setSeguros(response.data.data);
        } catch (error) {
            console.error('Error fetching seguros:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'idEspecialidad' || name === 'seguroId') ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            precio: Number(formData.precio)
        };
        try {
            if (isEditMode) {
                await api.patch(`/arancel-seguro/${id}`, dataToSave);
                await Swal.fire({
                    icon: 'success',
                    title: 'Actualizado',
                    text: 'Arancel de seguro actualizado exitosamente',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await api.post('/arancel-seguro', dataToSave);
                await Swal.fire({
                    icon: 'success',
                    title: 'Creado',
                    text: 'Arancel de seguro creado exitosamente',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            onSaveSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving arancel seguro:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Error al guardar los datos'
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <span className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl text-blue-600 dark:text-blue-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </span>
                        {isEditMode ? 'Editar Arancel Seguro' : 'Nuevo Arancel Seguro'}
                    </h2>
                </div>

                <div className="p-5 overflow-y-auto">
                    <form onSubmit={handleSubmit} id="arancel-seguro-form">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!seguroId && (
                                <div className="md:col-span-2 mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Seguro / Convenio
                                    </label>
                                    <select
                                        name="seguroId"
                                        value={formData.seguroId}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all"
                                    >
                                        <option value="">-- seleccionar seguro --</option>
                                        {seguros.map(s => (
                                            <option key={s.id} value={s.id}>{s.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="md:col-span-2 mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Especialidad
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        name="idEspecialidad"
                                        value={formData.idEspecialidad}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all"
                                    >
                                        <option value="">-- seleccionar especialidad --</option>
                                        {especialidades.map(esp => (
                                            <option key={esp.id} value={esp.id}>{esp.especialidad}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setIsEspecialidadModalOpen(true)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="md:col-span-2 mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Código
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Tag size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="codigo"
                                        value={formData.codigo}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all"
                                        placeholder="Ej: COD-001"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 mb-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Descripción
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <ClipboardList size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="detalle"
                                        value={formData.detalle}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all"
                                        placeholder="Descripción del tratamiento..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Precio
                                </label>
                                <input
                                    type="number"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Moneda
                                </label>
                                <select
                                    name="moneda"
                                    value={formData.moneda}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-all"
                                >
                                    <option value="" disabled>-- Seleccione --</option>
                                    <option value="Bolivianos">Bolivianos</option>
                                    <option value="Dólares">Dólares</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-start gap-3">
                    <button
                        type="submit"
                        form="arancel-seguro-form"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                    >
                        <Save size={18} />
                        {isEditMode ? 'Actualizar' : 'Guardar'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                    >
                        <X size={18} />
                        Cancelar
                    </button>
                </div>
            </div>

            <EspecialidadForm
                isOpen={isEspecialidadModalOpen}
                onClose={() => setIsEspecialidadModalOpen(false)}
                onSaveSuccess={() => {
                    fetchEspecialidades();
                    setIsEspecialidadModalOpen(false);
                }}
            />
        </div>
    );
};

export default ArancelSeguroForm;
