import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Save, Loader2, LogOut } from 'lucide-react';
import api from '../services/api';
import Swal from 'sweetalert2';
import type { HistoriaClinicaSeguro } from '../types';

interface SeguimientoImagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: HistoriaClinicaSeguro | null;
    onRefresh: () => void;
}

const SeguimientoImagesModal: React.FC<SeguimientoImagesModalProps> = ({ isOpen, onClose, item, onRefresh }) => {
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (item) {
            setDescripcion(item.imagen_descripcion || '');
        }
    }, [item, isOpen]);

    if (!isOpen || !item) return null;

    const handleSaveDescriptions = async () => {
        setLoading(true);
        try {
            await api.patch(`/historia-clinica-seguro/${item.id}`, { imagen_descripcion: descripcion });
            Swal.fire({ icon: 'success', title: 'Descripción guardada', timer: 1500, showConfirmButton: false });
            onRefresh();
        } catch (error) {
            console.error('Error saving description:', error);
            Swal.fire('Error', 'No se pudo guardar la descripción', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post(`/historia-clinica-seguro/${item.id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Swal.fire({ icon: 'success', title: 'Imagen subida', timer: 1000, showConfirmButton: false });
            onRefresh();
        } catch (error) {
            console.error('Error uploading image:', error);
            Swal.fire('Error', 'No se pudo subir la imagen', 'error');
        } finally {
            setUploading(false);
        }
    };

    const getFullImageUrl = (url: string) => {
        return `${api.defaults.baseURL?.replace('/api', '')}${url}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-white/20">
                {/* Header */}
                <div className="px-6 py-4 bg-emerald-600 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <ImageIcon size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold">Imagen de Seguimiento</h3>
                            <p className="text-[10px] text-emerald-100 opacity-80">
                                {item.arancel?.detalle} - Pieza {item.pieza || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Fotografía Clínica</h4>
                            <div className="relative">
                                <input 
                                    type="file" 
                                    id="upload-imagen"
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    disabled={uploading || item.proformaSeguro?.estado === 'pagada'}
                                />
                                <label 
                                    htmlFor="upload-imagen"
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                        uploading || item.proformaSeguro?.estado === 'pagada'
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                            : 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer'
                                    }`}
                                >
                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                                    {item.imagen ? 'Cambiar Imagen' : 'Subir Imagen'}
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Preview */}
                            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                                {item.imagen ? (
                                    <img 
                                        src={getFullImageUrl(item.imagen)} 
                                        alt="Seguimiento" 
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => {
                                            Swal.fire({
                                                imageUrl: getFullImageUrl(item.imagen!),
                                                imageAlt: 'Seguimiento',
                                                title: '<span class="text-emerald-600 font-bold">Imagen de Seguimiento</span>',
                                                html: descripcion ? `<div class="mt-4 p-4 bg-gray-50 rounded-xl text-gray-700 italic border-l-4 border-emerald-500">${descripcion}</div>` : '',
                                                showConfirmButton: false,
                                                showCloseButton: true,
                                                width: '60%',
                                                customClass: {
                                                    image: 'rounded-2xl shadow-2xl border-4 border-white',
                                                    popup: 'rounded-3xl'
                                                }
                                            });
                                        }}
                                    />
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-xs text-gray-500">Sin imagen</p>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Explicación / Observación</label>
                                <textarea
                                    className={`w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none ${item.proformaSeguro?.estado === 'pagada' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    placeholder="Escriba aquí la explicación de esta imagen..."
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    disabled={item.proformaSeguro?.estado === 'pagada'}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <LogOut size={18} />
                        Salir
                    </button>
                    <button
                        onClick={handleSaveDescriptions}
                        disabled={loading || item.proformaSeguro?.estado === 'pagada'}
                        className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SeguimientoImagesModal;
