import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import type { Doctor, Arancel, HistoriaClinicaSeguro } from '../types';
import { getLocalDateString, formatDate } from '../utils/dateUtils';
import { formatFullName } from '../utils/formatters';
import { 
    Activity, Plus, Save, Trash2, Edit, CheckCircle, 
    AlertCircle, Search, ClipboardList, User, Calendar,
    FileText, Hash, X, Camera, Image, Printer
} from 'lucide-react';
import Pagination from './Pagination';
import ManualModal from './ManualModal';
import type { ManualSection } from './ManualModal';
import SeguimientoImagesModal from './SeguimientoImagesModal';
import SeguimientoViewModal from './SeguimientoViewModal';

const PacienteTabSeguimientoSeguro: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [historia, setHistoria] = useState<HistoriaClinicaSeguro[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<HistoriaClinicaSeguro | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showManual, setShowManual] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [aranceles, setAranceles] = useState<any[]>([]);
    const [paciente, setPaciente] = useState<any>(null);
    const [showImagesModal, setShowImagesModal] = useState(false);
    const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
    const [selectedItemForImages, setSelectedItemForImages] = useState<HistoriaClinicaSeguro | null>(null);

    const [formData, setFormData] = useState({
        fecha: getLocalDateString(),
        arancelId: 0,
        pieza: '',
        cantidad: 1,
        observaciones: '',
        doctorId: 0,
        diagnostico: '',
        precio: 0,
        estadoTratamiento: 'no terminado',
        pagado: 'no',
        cobrado: 'no',
        casoClinico: false
    });

    const manualSections: ManualSection[] = [
        {
            title: 'Seguimiento Clínico de Seguro',
            content: 'Registro detallado de todos los tratamientos realizados al paciente bajo convenio de seguro.'
        },
        {
            title: 'Estados y Diagnóstico',
            content: 'Puede marcar tratamientos como terminados, registrar diagnósticos específicos y observaciones detalladas para cada evolución.'
        },
        {
            title: 'Cobros y Casos Clínicos',
            content: 'Utilice el campo Cobrado para llevar el control administrativo de los pagos del seguro. El interruptor de Caso Clínico permite destacar evoluciones importantes.'
        }
    ];

    const fetchHistory = async () => {
        if (!id) return;
        try {
            const response = await api.get(`/historia-clinica-seguro?pacienteSeguroId=${id}`);
            setHistoria(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuxData = async () => {
        try {
            // 1. Fetch patient to get seguroId
            const pacRes = await api.get(`/pacientes-seguro/${id}`);
            const pacData = pacRes.data;
            setPaciente(pacData);

            // 2. Fetch doctors and aranceles based on seguroId
            const [docsRes, aranRes] = await Promise.all([
                api.get('/doctors'),
                api.get(`/arancel-seguro?limit=2000&seguroId=${pacData.seguroId || ''}`)
            ]);

            setDoctors((docsRes.data.data || docsRes.data).filter((d: any) => d.estado === 'activo'));
            
            const insuranceAranceles = aranRes.data.data || aranRes.data;
            setAranceles(insuranceAranceles.filter((a: any) => a.estado === 'activo'));
        } catch (error) {
            console.error('Error fetching aux data:', error);
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchAuxData();
    }, [id]);

    useEffect(() => {
        if (editingItem) {
            setFormData({
                fecha: editingItem.fecha,
                arancelId: editingItem.arancelId || 0,
                pieza: editingItem.pieza || '',
                cantidad: editingItem.cantidad,
                observaciones: editingItem.observaciones || '',
                doctorId: editingItem.doctorId || 0,
                diagnostico: editingItem.diagnostico || '',
                precio: editingItem.precio,
                estadoTratamiento: editingItem.estadoTratamiento,
                pagado: editingItem.pagado,
                cobrado: editingItem.cobrado || 'no',
                casoClinico: editingItem.casoClinico || false
            });
            setShowForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [editingItem]);

    const handleOpenImagesModal = (item: HistoriaClinicaSeguro) => {
        setSelectedItemForImages(item);
        setShowImagesModal(true);
    };

    useEffect(() => {
        if (showImagesModal && selectedItemForImages) {
            const updated = historia.find(h => h.id === selectedItemForImages.id);
            if (updated) setSelectedItemForImages(updated);
        }
    }, [historia, showImagesModal, selectedItemForImages]);

    const resetForm = () => {
        setFormData({
            fecha: getLocalDateString(),
            arancelId: 0,
            pieza: '',
            cantidad: 1,
            observaciones: '',
            doctorId: 0,
            diagnostico: '',
            precio: 0,
            estadoTratamiento: 'no terminado',
            pagado: 'no',
            cobrado: 'no',
            casoClinico: false
        });
        setEditingItem(null);
        setShowForm(false);
    };

    const handleArancelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const arancelId = Number(e.target.value);
        const selected = aranceles.find(a => a.id === arancelId);
        setFormData(prev => ({
            ...prev,
            arancelId,
            precio: selected ? Number(selected.precio) * prev.cantidad : 0
        }));
    };

    const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cantidad = Number(e.target.value);
        const selected = aranceles.find(a => a.id === formData.arancelId);
        setFormData(prev => ({
            ...prev,
            cantidad,
            precio: selected ? Number(selected.precio) * cantidad : prev.precio
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                ...formData,
                pacienteSeguroId: Number(id),
                arancelId: formData.arancelId || null,
                doctorId: formData.doctorId || null
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

            if (editingItem) {
                await api.patch(`/historia-clinica-seguro/${editingItem.id}`, payload);
                Swal.fire({ icon: 'success', title: 'Registro actualizado', timer: 1500, showConfirmButton: false });
            } else {
                await api.post('/historia-clinica-seguro', payload);
                Swal.fire({ icon: 'success', title: 'Registro guardado', timer: 1500, showConfirmButton: false });
            }
            resetForm();
            fetchHistory();
        } catch (error) {
            console.error('Error saving history:', error);
            Swal.fire('Error', 'No se pudo guardar el registro', 'error');
        }
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.src = src;
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e: any) => reject(e);
        });
    };

    const handlePrintHistory = async () => {
        const doc = new jsPDF();
        const filteredHist = filteredHistoria;

        try {
            const logoSrc = "/logo-codel.jpg";
            if (logoSrc) {
                const logo = await loadImage(logoSrc);
                doc.addImage(logo, 'PNG', 14, 15, 35, 14);
            }
        } catch (error) {
            console.warn('Could not load logo', error);
        }

        // Header
        const pageWidth = doc.internal.pageSize.width;
        doc.setDrawColor(52, 152, 219); // #3498db
        doc.setLineWidth(1);
        doc.line(15, 35, pageWidth - 15, 35);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80); // #2c3e50
        doc.text('SEGUIMIENTO CLÍNICO (SEGURO)', 105, 25, { align: 'center' });
        doc.setTextColor(0, 0, 0);

        // Patient info box
        const boxY = 40;
        const boxHeight = 12;

        // Gray background
        doc.setFillColor(248, 249, 250); // #f8f9fa
        doc.rect(15, boxY, pageWidth - 30, boxHeight, 'F');

        // Blue left border
        doc.setFillColor(52, 152, 219); // #3498db
        doc.rect(15, boxY, 2, boxHeight, 'F');

        // Patient info text
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('PACIENTE:', 20, boxY + 7);
        doc.setFont('helvetica', 'normal');
        const pacienteNombre = paciente
            ? `${paciente.nombre} ${paciente.paterno} ${paciente.materno}`
            : 'N/A';
        doc.text(pacienteNombre.toUpperCase(), 45, boxY + 7);

        // Table
        if (filteredHist.length > 0) {
            const tableColumn = ["Fecha", "Pieza", "Tratamiento", "Observaciones", "Cant.", "Doctor", "Diagnóstico", "Estado"];
            const tableRows = filteredHist.map(item => [
                formatDate(item.fecha),
                item.pieza || '-',
                item.arancel?.detalle || '-',
                item.observaciones || '-',
                item.cantidad,
                item.doctor ? formatFullName(item.doctor) : '-',
                item.diagnostico || '-',
                item.estadoTratamiento
            ]);

            const tableStartY = boxY + boxHeight + 5;

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: tableStartY,
                theme: 'plain',
                margin: { left: 15, right: 15 },
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [52, 152, 219], // #3498db
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    lineWidth: 0,
                },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 12 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 'auto' }, 
                    4: { cellWidth: 10 },
                    5: { cellWidth: 25 },
                    6: { cellWidth: 30 },
                    7: { cellWidth: 20 }
                },
                alternateRowStyles: {
                    fillColor: [248, 249, 250] // #f8f9fa
                }
            });
        }

        doc.autoPrint();
        const blobUrl = doc.output('bloburl');
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.opacity = '0';
        iframe.style.border = '0';
        iframe.src = String(blobUrl);
        document.body.appendChild(iframe);

        // Clean up the iframe from DOM after print dialog has been triggered
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 3000);
    };

    const handleDelete = async (itemId: number) => {
        const result = await Swal.fire({
            title: '¿Eliminar registro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/historia-clinica-seguro/${itemId}`);
                fetchHistory();
                Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
            }
        }
    };

    const filteredHistoria = Array.isArray(historia) ? historia.filter(item => {
        const term = searchTerm.toLowerCase();
        const pieza = (item.pieza || '').toLowerCase();
        const tratamiento = (item.arancel?.detalle || '').toLowerCase();
        const diagnostico = (item.diagnostico || '').toLowerCase();
        return pieza.includes(term) || tratamiento.includes(term) || diagnostico.includes(term);
    }) : [];

    const totalPages = Math.ceil(filteredHistoria.length / itemsPerPage);
    const paginatedHistoria = filteredHistoria.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="space-y-6">
            {/* Form section at the very TOP */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-fade-in-down">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                                <Edit className="w-5 h-5 text-emerald-500" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                                {editingItem ? 'Editar Seguimiento Clínico' : 'Nuevo Seguimiento Clínico'}
                            </h4>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Fila 1: Fecha y Tratamiento */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Fecha */}
                            <div className="space-y-2 md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Fecha</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        type="date"
                                        className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${editingItem?.cobrado === 'si' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        value={formData.fecha}
                                        onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                                        disabled={editingItem?.cobrado === 'si'}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Tratamiento */}
                            <div className="space-y-2 md:col-span-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Tratamiento</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Activity size={18} />
                                    </div>
                                    <select
                                        className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none ${editingItem?.cobrado === 'si' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        value={formData.arancelId}
                                        onChange={handleArancelChange}
                                        disabled={editingItem?.cobrado === 'si'}
                                        required
                                    >
                                        <option value={0}>-- Seleccione Tratamiento --</option>
                                        {aranceles.map(a => (
                                            <option key={a.id} value={a.id}>{a.detalle}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Fila 2: Pieza, Cantidad, Doctor */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Pieza */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Pieza(s)</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <div className="w-4 h-4 border-2 border-gray-400 rounded-sm transform rotate-45"></div>
                                    </div>
                                    <input
                                        type="text"
                                        className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${editingItem?.cobrado === 'si' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        value={formData.pieza}
                                        onChange={e => setFormData({ ...formData, pieza: e.target.value })}
                                        disabled={editingItem?.cobrado === 'si'}
                                        placeholder="Ej. 11, 12..."
                                    />
                                </div>
                            </div>

                            {/* Cantidad */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Cantidad</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <Hash size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${editingItem?.cobrado === 'si' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        value={formData.cantidad}
                                        onChange={handleCantidadChange}
                                        disabled={editingItem?.cobrado === 'si'}
                                        min={1}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Doctor */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Doctor</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <User size={18} />
                                    </div>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none"
                                        value={formData.doctorId}
                                        onChange={e => setFormData({ ...formData, doctorId: Number(e.target.value) })}
                                        required
                                    >
                                        <option value={0}>-- Seleccione --</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>{formatFullName(d)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Fila 3: Diagnóstico */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Diagnóstico</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <FileText size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                    value={formData.diagnostico}
                                    onChange={e => setFormData({ ...formData, diagnostico: e.target.value })}
                                    placeholder="Escriba un diagnóstico (opcional)"
                                />
                            </div>
                        </div>

                        {/* Fila 4: Observaciones */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Descripción del Tratamiento Realizado</label>
                            <div className="relative">
                                <div className="absolute left-3 top-4 text-gray-400">
                                    <FileText size={18} />
                                </div>
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all min-h-[100px]"
                                    value={formData.observaciones}
                                    onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                                    placeholder="Detalle observaciones o procedimientos adicionales..."
                                />
                            </div>
                        </div>

                        {/* Bottom Sections: Estados & Opciones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-gray-100 dark:border-gray-700">
                            {/* Estados Section */}
                            <div className="space-y-4">
                                <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Estados</h5>
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-400">Tratamiento</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input 
                                                    type="radio" 
                                                    name="estadoTratamiento"
                                                    className="sr-only"
                                                    checked={formData.estadoTratamiento === 'terminado'}
                                                    onChange={() => setFormData({ ...formData, estadoTratamiento: 'terminado' })}
                                                    disabled={editingItem?.cobrado === 'si'}
                                                />
                                                <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${formData.estadoTratamiento === 'terminado' ? 'border-emerald-500' : 'border-gray-300 group-hover:border-gray-400'} ${editingItem?.cobrado === 'si' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    {formData.estadoTratamiento === 'terminado' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-scale-in"></div>}
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold transition-colors ${formData.estadoTratamiento === 'terminado' ? 'text-emerald-600' : 'text-gray-500'} ${editingItem?.cobrado === 'si' ? 'opacity-60' : ''}`}>Terminado</span>
                                        </label>
                                        <label className={`flex items-center gap-2 cursor-pointer group ${editingItem?.cobrado === 'si' ? 'pointer-events-none' : ''}`}>
                                            <div className="relative flex items-center justify-center">
                                                <input 
                                                    type="radio" 
                                                    name="estadoTratamiento"
                                                    className="sr-only"
                                                    checked={formData.estadoTratamiento === 'no terminado'}
                                                    onChange={() => setFormData({ ...formData, estadoTratamiento: 'no terminado' })}
                                                    disabled={editingItem?.cobrado === 'si'}
                                                />
                                                <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${formData.estadoTratamiento === 'no terminado' ? 'border-blue-500' : 'border-gray-300 group-hover:border-gray-400'} ${editingItem?.cobrado === 'si' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    {formData.estadoTratamiento === 'no terminado' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-scale-in"></div>}
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold transition-colors ${formData.estadoTratamiento === 'no terminado' ? 'text-blue-600' : 'text-gray-500'} ${editingItem?.cobrado === 'si' ? 'opacity-60' : ''}`}>No Terminado</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Opciones Section */}
                            <div className="space-y-4">
                                <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Opciones</h5>
                                <div className="flex flex-wrap gap-6">
                                    <label className={`flex items-center gap-3 cursor-pointer group w-fit ${editingItem?.cobrado === 'si' ? 'pointer-events-none opacity-60' : ''}`}>
                                        <div 
                                            className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${formData.casoClinico ? 'bg-gray-800 border-gray-800' : 'border-gray-300 group-hover:border-gray-400 bg-white'}`}
                                            onClick={() => {
                                                if (editingItem?.cobrado !== 'si') {
                                                    setFormData({ ...formData, casoClinico: !formData.casoClinico });
                                                }
                                            }}
                                        >
                                            {formData.casoClinico && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Caso Clínico</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex justify-start gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 mt-6">
                            <button
                                type="submit"
                                className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <Save size={18} />
                                {editingItem ? 'Actualizar Seguimiento' : 'Guardar Seguimiento'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <X size={18} />
                                {editingItem ? 'Cancelar Edición' : 'Cancelar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Section: Title, Search, and Table */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <span className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    </span>
                    Historial de Seguimiento Clínico de Seguro
                </h3>

                {/* Search Bar & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                    <div className="flex gap-2 w-full md:max-w-md">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Buscar por Pieza, Tratamiento o Diagnóstico..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowManual(true)}
                            className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-1.5 rounded-full flex items-center justify-center w-[30px] h-[30px] text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
                            title="Ayuda / Manual"
                        >
                            ?
                        </button>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                Nuevo Seguimiento
                            </button>
                        )}
                        <button
                            onClick={() => setShowSeguimientoModal(true)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <ClipboardList size={20} />
                            Ver Seguimiento
                        </button>
                        <button
                            onClick={handlePrintHistory}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <Printer size={20} />
                            Imprimir
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">
                        Mostrando <span className="text-gray-800 dark:text-gray-200">{filteredHistoria.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredHistoria.length)}</span> de <span>{filteredHistoria.length}</span> registros
                    </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-4">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tratamiento</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pieza</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cant.</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Observaciones</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Diagnóstico</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Est. Trat.</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cobrado</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedHistoria.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{formatDate(item.fecha)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 font-medium">
                                        {item.arancel?.detalle || 'Tratamiento General'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                        {item.pieza ? (
                                            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800 uppercase">
                                                {item.pieza}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">{item.cantidad}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={item.observaciones}>
                                        {item.observaciones || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={item.diagnostico}>
                                        {item.diagnostico || '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                        {formatFullName(item.doctor)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 rounded text-sm ${item.estadoTratamiento === 'terminado'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                            }`}>
                                            {item.estadoTratamiento}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 rounded text-sm ${item.cobrado === 'si'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300'
                                            }`}>
                                            {item.cobrado === 'si' ? 'SÍ' : 'NO'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* Botón único de Imágenes */}
                                            <button 
                                                onClick={() => handleOpenImagesModal(item)}
                                                disabled={item.proformaSeguro?.estado === 'pagada'}
                                                className={`p-1.5 rounded-lg shadow-md transition-all transform flex items-center gap-1.5 px-2.5 ${
                                                    item.proformaSeguro?.estado === 'pagada'
                                                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                                        : (item.imagen) 
                                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5' 
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:-translate-y-0.5'
                                                }`}
                                                title={item.proformaSeguro?.estado === 'pagada' ? "No se pueden gestionar imágenes de un registro con proforma pagada" : "Gestionar Imágenes y Descripciones"}
                                            >
                                                { (item.imagen) ? <Image size={16} /> : <Camera size={16} /> }
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Imágenes</span>
                                            </button>

                                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                                            <button
                                                onClick={() => setEditingItem(item)}
                                                className="p-1.5 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
                                                title={item.cobrado === 'si' ? "Edición restringida (Solo observaciones, diagnóstico y doctor)" : "Editar"}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                disabled={item.cobrado === 'si'}
                                                className={`p-1.5 rounded-lg shadow-md transition-all transform ${
                                                    item.cobrado === 'si'
                                                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-red-500 hover:bg-red-600 text-white hover:-translate-y-0.5'
                                                }`}
                                                title={item.cobrado === 'si' ? "No se puede eliminar un registro cobrado" : "Eliminar"}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedHistoria.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-lg font-medium">{searchTerm ? 'No se encontraron resultados.' : 'No hay registros en el seguimiento clínico.'}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            <SeguimientoImagesModal 
                isOpen={showImagesModal}
                onClose={() => {
                    setShowImagesModal(false);
                    setSelectedItemForImages(null);
                }}
                item={selectedItemForImages}
                onRefresh={fetchHistory}
            />

            <ManualModal
                isOpen={showManual}
                onClose={() => setShowManual(false)}
                title="Manual - Seguimiento Clínico Seguro"
                sections={manualSections}
            />

            <SeguimientoViewModal
                isOpen={showSeguimientoModal}
                onClose={() => setShowSeguimientoModal(false)}
                historia={historia}
                paciente={paciente}
                isSeguro={true}
            />
        </div>
    );
};

export default PacienteTabSeguimientoSeguro;
