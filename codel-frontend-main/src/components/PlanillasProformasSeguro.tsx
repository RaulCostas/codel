import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatFullName, formatNumber, formatCurrency } from '../utils/formatters';
import { getLocalDateString, formatDate } from '../utils/dateUtils';
import { 
    FileText, Download, Search, Shield, Printer,
    CheckSquare, Square, Save, AlertCircle, RefreshCw, History, Check, XCircle,
    Eye, Edit2, Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import type { Seguro, HistoriaClinicaSeguro, ProformaSeguro, FormaPago } from '../types';
import { Plus } from 'lucide-react';
import ManualModal, { type ManualSection } from './ManualModal';

const PlanillasProformasSeguro: React.FC = () => {
    const [registros, setRegistros] = useState<HistoriaClinicaSeguro[]>([]);
    const [historial, setHistorial] = useState<ProformaSeguro[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'generar' | 'historial'>('generar');
    const [currentPage, setCurrentPage] = useState(1);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyStatusFilter, setHistoryStatusFilter] = useState('todos');
    const itemsPerPage = 10;
    const [showManual, setShowManual] = useState(false);

    const manualSections: ManualSection[] = [
        {
            title: 'Gestión de Proformas y Planillas',
            content: 'Este módulo permite agrupar tratamientos realizados a pacientes de seguro para generar la documentación de cobro (Proforma y Planilla).'
        },
        {
            title: 'Generar Nueva Proforma',
            content: '1. Seleccione el Seguro. 2. Elija los tratamientos. 3. Defina el periodo (Mes/Año). 4. Puede ajustar la "Fecha Planilla" de cada ítem antes de guardar.'
        },
        {
            title: 'Registro Histórico',
            content: 'Aquí puede ver todas las proformas generadas, filtrar por estado (Pagada, Anulada, Generada), registrar pagos adjuntando la factura PDF o editar el contenido de proformas pendientes.'
        },
        {
            title: 'Edición de Proformas',
            content: 'Al editar una proforma, puede eliminar tratamientos (que volverán a estar disponibles), agregar nuevos tratamientos pendientes del mismo seguro o cambiar el periodo y las fechas de planilla.'
        }
    ];

    // Selección
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Proforma Generada Recientemente
    const [generatedProforma, setGeneratedProforma] = useState<ProformaSeguro | null>(null);

    // Fechas editadas para la planilla
    const [editedDates, setEditedDates] = useState<Record<number, string>>({});

    // Periodo (Mes Año)
    const [periodo, setPeriodo] = useState(() => {
        const now = new Date();
        const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
        return `${months[now.getMonth()]} ${now.getFullYear()}`;
    });

    // Modales y Visualización
    const [viewingProforma, setViewingProforma] = useState<ProformaSeguro | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingProforma, setEditingProforma] = useState<ProformaSeguro | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPagoModal, setShowPagoModal] = useState(false);
    const [proformaParaPagar, setProformaParaPagar] = useState<ProformaSeguro | null>(null);
    const [formasPago, setFormasPago] = useState<FormaPago[]>([]);
    const [pagoData, setPagoData] = useState({
        fecha_pago: getLocalDateString(),
        formaPagoId: '',
        archivos: [] as File[]
    });

    const [seguros, setSeguros] = useState<Seguro[]>([]);
    const [selectedSeguroId, setSelectedSeguroId] = useState<string>('');

    useEffect(() => {
        fetchSeguros();
        if (activeTab === 'generar') {
            fetchData();
        } else {
            fetchHistorial();
        }
        fetchFormasPago();
    }, [activeTab]);

    const fetchSeguros = async () => {
        try {
            const resp = await api.get('/seguro?limit=100');
            const data = resp.data.data || [];
            setSeguros(data);
            if (data.length > 0 && !selectedSeguroId) {
                // No auto-seleccionar para obligar al usuario a elegir
            }
        } catch (error) {
            console.error('Error fetching seguros:', error);
        }
    };

    const fetchFormasPago = async () => {
        try {
            // Solicitamos todas las formas de pago (limit 100 para asegurar traer todas)
            const resp = await api.get('/forma-pago?limit=100');
            const dataArray = resp.data.data || [];
            setFormasPago(dataArray);
            if (dataArray.length > 0 && !pagoData.formaPagoId) {
                setPagoData(prev => ({ ...prev, formaPagoId: dataArray[0].id.toString() }));
            }
        } catch (error) {
            console.error('Error fetching formas pago:', error);
        }
    };

    const fetchHistorial = async () => {
        setLoading(true);
        try {
            const response = await api.get('/proforma-seguro');
            setHistorial(response.data);
        } catch (error) {
            console.error('Error fetching historial:', error);
            Swal.fire('Error', 'No se pudo cargar el historial', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener todos los tratamientos pendientes
            const response = await api.get('/historia-clinica-seguro');
            let data: HistoriaClinicaSeguro[] = response.data;

            // Filtrar: Terminados, NO cobrados, NO pagados, sin proforma previa
            data = data.filter(item => 
                item.estadoTratamiento === 'terminado' &&
                item.cobrado === 'no' &&
                item.pagado === 'no' &&
                !item.proformaSeguroId
            );

            // Ordenar por fecha ascendente
            data.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

            setRegistros(data);
            setSelectedIds(new Set());
            setEditedDates({}); // Reset edited dates
        } catch (error) {
            console.error('Error fetching insurance history:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSelect = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleDateChange = (id: number, date: string) => {
        setEditedDates(prev => ({
            ...prev,
            [id]: date
        }));
    };

    const handleSelectAll = () => {
        if (selectedIds.size === allFilteredData.length) {
            setSelectedIds(new Set());
        } else {
            const allIds = new Set(allFilteredData.map(item => item.id));
            setSelectedIds(allIds);
        }
    };

    const handleGuardarProforma = async () => {
        if (!selectedSeguroId) {
            Swal.fire('Aviso', 'Seleccione un Seguro en el panel superior antes de generar la proforma', 'warning');
            return;
        }
        if (selectedIds.size === 0) {
            Swal.fire('Aviso', 'Seleccione al menos un tratamiento', 'warning');
            return;
        }

        try {
            Swal.fire({
                title: 'Generando Proforma...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const detalles = Array.from(selectedIds).map(id => ({
                id,
                fechaPlanilla: editedDates[id]
            }));

            // Obtener usuarioId del localStorage
            const userStr = localStorage.getItem('user');
            const usuarioId = userStr ? JSON.parse(userStr).id : undefined;

            const response = await api.post('/proforma-seguro', {
                seguroId: Number(selectedSeguroId),
                detalles,
                periodo, // Enviamos el periodo seleccionado
                usuarioId
            });

            const nuevaProforma = response.data;
            setGeneratedProforma(nuevaProforma);
            
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Proforma y Planilla generadas correctamente',
                timer: 1500,
                showConfirmButton: false
            });
            
            // Limpiar selección y refrescar
            setSelectedIds(new Set());
            setEditedDates({});
            fetchData();
            fetchHistorial();
        } catch (error: any) {
            console.error('Error guardando proforma:', error);
            Swal.fire('Error', error.response?.data?.message || 'No se pudo guardar la proforma', 'error');
        }
    };

    const allFilteredData = registros.filter(item => {
        if (!selectedSeguroId) return false;

        const term = searchTerm.toLowerCase();
        const paciente = formatFullName(item.pacienteSeguro).toLowerCase();
        const matricula = (item.pacienteSeguro?.matricula_seguro || '').toLowerCase();
        const tratamiento = (item.arancel?.detalle || '').toLowerCase();
        
        const matchesSearch = paciente.includes(term) || matricula.includes(term) || tratamiento.includes(term);
        const matchesSeguro = item.pacienteSeguro?.seguro?.id === Number(selectedSeguroId);
        
        return matchesSearch && matchesSeguro;
    });

    const paginatedData = allFilteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(allFilteredData.length / itemsPerPage);

    const filteredHistorial = historial.filter(prof => {
        if (historyStatusFilter === 'todos') return true;
        return prof.estado === historyStatusFilter;
    });

    const paginatedHistorial = filteredHistorial.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);
    const totalHistoryPages = Math.ceil(filteredHistorial.length / itemsPerPage);

    const totalSeleccionado = Array.from(selectedIds).reduce((acc, id) => {
        const item = registros.find(r => r.id === id);
        return acc + (item ? Number(item.precio) : 0);
    }, 0);

    const getAgrupadosPorPaciente = (detalles: HistoriaClinicaSeguro[]) => {
        // Ordenar por fecha ascendente antes de agrupar
        const sorted = [...detalles].sort((a, b) => {
            const dateA = new Date(a.fechaPlanilla || a.fecha).getTime();
            const dateB = new Date(b.fechaPlanilla || b.fecha).getTime();
            return dateA - dateB;
        });

        const agrupados: Record<number, { paciente: string, matricula: string, tratamientos: HistoriaClinicaSeguro[], subtotal: number }> = {};
        sorted.forEach(t => {
            const pId = t.pacienteSeguroId;
            if (!agrupados[pId]) {
                agrupados[pId] = {
                    paciente: formatFullName(t.pacienteSeguro),
                    matricula: t.pacienteSeguro?.matricula_seguro || '---',
                    tratamientos: [],
                    subtotal: 0
                };
            }
            agrupados[pId].tratamientos.push(t);
            agrupados[pId].subtotal += Number(t.precio);
        });
        return Object.values(agrupados);
    };

    const handleMarcarPagada = (id: number) => {
        const prof = historial.find(p => p.id === id);
        if (prof) {
            setProformaParaPagar(prof);
            setPagoData({
                fecha_pago: getLocalDateString(),
                formaPagoId: formasPago.length > 0 ? formasPago[0].id.toString() : '',
                archivos: []
            });
            setShowPagoModal(true);
        }
    };

    const handleCrearFormaPago = async () => {
        const { value: nuevaForma } = await Swal.fire({
            title: 'Nueva Forma de Pago',
            input: 'text',
            inputLabel: 'Nombre de la forma de pago',
            inputPlaceholder: 'Ej: Transferencia Banco Unión',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) return 'Debes escribir un nombre';
            }
        });

        if (nuevaForma) {
            try {
                const resp = await api.post('/forma-pago', { forma_pago: nuevaForma, estado: 'activo' });
                await fetchFormasPago();
                setPagoData(prev => ({ ...prev, formaPagoId: resp.data.id.toString() }));
                Swal.fire({ icon: 'success', title: 'Creado', timer: 1500, showConfirmButton: false });
            } catch (error) {
                Swal.fire('Error', 'No se pudo crear la forma de pago', 'error');
            }
        }
    };

    const handleConfirmarPago = async () => {
        if (!proformaParaPagar) return;
        if (pagoData.archivos.length === 0) {
            Swal.fire('Atención', 'Debe adjuntar al menos un PDF de la factura', 'warning');
            return;
        }

        try {
            Swal.fire({ title: 'Procesando Pago...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            const formData = new FormData();
            formData.append('estado', 'pagada');
            formData.append('fecha_pago', pagoData.fecha_pago);
            formData.append('formaPagoId', pagoData.formaPagoId);
            
            // Adjuntar todos los archivos
            pagoData.archivos.forEach(file => {
                formData.append('archivos', file);
            });

            await api.patch(`/proforma-seguro/${proformaParaPagar.id}/estado`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Swal.fire({
                icon: 'success',
                title: 'Pago Registrado',
                text: 'La proforma ha sido marcada como pagada correctamente.',
                timer: 1500,
                showConfirmButton: false
            });
            
            setShowPagoModal(false);
            fetchHistorial();
        } catch (error) {
            console.error('Error registrando pago:', error);
            Swal.fire('Error', 'No se pudo registrar el pago', 'error');
        }
    };

    const handleAnular = async (id: number) => {
        const confirm = await Swal.fire({
            title: '¿Anular Proforma?',
            text: "Los tratamientos volverán a estar pendientes de cobro.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            try {
                await api.patch(`/proforma-seguro/${id}/estado`, { estado: 'anulada' });
                Swal.fire({
                    icon: 'success',
                    title: 'Anulada',
                    text: 'La proforma ha sido anulada',
                    showConfirmButton: false,
                    timer: 1500
                });
                fetchHistorial();
            } catch (error) {
                Swal.fire('Error', 'No se pudo anular', 'error');
            }
        }
    };

    const handleRemoverTratamiento = async (proformaId: number, tratamientoId: number) => {
        if (editingProforma) {
            // Edición local diferida
            setEditingProforma(prev => {
                if (!prev) return null;
                const newDetalles = (prev.detalles || []).filter(d => d.id !== tratamientoId);
                const newTotal = newDetalles.reduce((sum, t) => sum + Number(t.precio || 0), 0);
                return { ...prev, detalles: newDetalles, total: newTotal };
            });
            return;
        }

        const confirm = await Swal.fire({
            title: '¿Eliminar tratamiento?',
            text: "El tratamiento se desvinculará de esta proforma y volverá a estar pendiente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            try {
                await api.delete(`/proforma-seguro/${proformaId}/tratamiento/${tratamientoId}`);
                
                await Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'Tratamiento removido correctamente',
                    showConfirmButton: false,
                    timer: 1500
                });
                
                // Actualizar historial
                fetchHistorial();
                fetchData(); // También actualizar registros pendientes
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el tratamiento', 'error');
            }
        }
    };

    const handleAgregarTratamiento = async (proformaId: number, tratamientoId: number) => {
        const tratamiento = registros.find(r => r.id === tratamientoId);
        if (!tratamiento) return;

        if (editingProforma) {
            // Agregar localmente
            setEditingProforma(prev => {
                if (!prev) return null;
                if (prev.detalles?.some(d => d.id === tratamientoId)) return prev;
                const newDetalles = [...(prev.detalles || []), tratamiento];
                const newTotal = newDetalles.reduce((sum, t) => sum + Number(t.precio || 0), 0);
                return { ...prev, detalles: newDetalles, total: newTotal };
            });
            return;
        }

        try {
            await api.post(`/proforma-seguro/${proformaId}/tratamiento/${tratamientoId}`);
            
            await Swal.fire({
                icon: 'success',
                title: 'Agregado',
                text: 'Tratamiento añadido correctamente',
                showConfirmButton: false,
                timer: 1500
            });
            
            // Actualizar listas
            fetchHistorial();
            fetchData();
        } catch (error) {
            Swal.fire('Error', 'No se pudo agregar el tratamiento', 'error');
        }
    };

    const handleUpdateFechaPlanilla = (proformaId: number, tratamientoId: number, nuevaFecha: string) => {
        // Actualización puramente local
        setEditingProforma(prev => {
            if (!prev) return null;
            const newDetalles = (prev.detalles || []).map(d => 
                d.id === tratamientoId ? { ...d, fechaPlanilla: nuevaFecha } : d
            );
            return { ...prev, detalles: newDetalles };
        });
    };

    const handleUpdatePeriodo = (proformaId: number, nuevoPeriodo: string) => {
        // Actualización puramente local
        setEditingProforma(prev => {
            if (!prev) return null;
            return { ...prev, periodo: nuevoPeriodo.toUpperCase() };
        });
    };

    const handleFinalizarEdicion = async () => {
        if (!editingProforma) return;

        try {
            Swal.fire({ title: 'Guardando cambios...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            
            const payload = {
                periodo: editingProforma.periodo,
                detalles: (editingProforma.detalles || []).map(d => ({
                    id: d.id,
                    fechaPlanilla: d.fechaPlanilla || d.fecha
                }))
            };

            await api.post(`/proforma-seguro/${editingProforma.id}/sync-data`, payload);
            
            Swal.close();
            await Swal.fire({
                icon: 'success',
                title: 'Guardado',
                text: 'Los cambios se han guardado correctamente',
                showConfirmButton: false,
                timer: 1500
            });

            setShowEditModal(false);
            setEditingProforma(null);
            fetchHistorial();
            fetchData();
        } catch (error: any) {
            Swal.close();
            console.error('Error al sincronizar proforma:', error);
            Swal.fire('Error', error.response?.data?.message || 'No se pudieron guardar los cambios', 'error');
        }
    };

    const fetchAndImprimir = async (id: number) => {
        try {
            Swal.fire({ title: 'Cargando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const response = await api.get(`/proforma-seguro/${id}`);
            const proformaData = response.data;

            // Obtener historiales de todos los pacientes en la proforma
            const patientIds = Array.from(new Set(proformaData.detalles.map((d: any) => d.pacienteSeguroId)));
            const historyPromises = patientIds.map(pid => api.get(`/historia-clinica-seguro?pacienteSeguroId=${pid}`));
            const historyResponses = await Promise.all(historyPromises);
            const allHistory = historyResponses.flatMap(r => r.data);

            Swal.close();
            handleImprimir(proformaData, allHistory);
        } catch (error) {
            console.error('Error fetching proforma for print:', error);
            Swal.fire('Error', 'No se pudo cargar la proforma', 'error');
        }
    };

    const fetchAndPDF = async (id: number) => {
        try {
            Swal.fire({ title: 'Cargando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const response = await api.get(`/proforma-seguro/${id}`);
            Swal.close();
            exportToPDF(response.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar la proforma', 'error');
        }
    };

    const handleImprimir = (proforma = generatedProforma, allHistory: any[] = []) => {
        if (!proforma || !proforma.detalles) return;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        const agrupados = getAgrupadosPorPaciente(proforma.detalles);
        const seguroName = 'PACIENTES CON SEGURO';

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Proforma y Planilla</title>
                <style>
                    @page { size: A4; margin: 1.5cm; }
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #333; line-height: 1.2; }
                    .header-container { display: flex; align-items: start; justify-content: space-between; margin-bottom: 20px; }
                    .logo { width: 180px; height: auto; }
                    .header-text { text-align: center; flex-grow: 1; margin-right: 180px; padding-top: 65px; } /* Center title compensating for logo */
                    h1 { color: #1e40af; font-size: 16px; margin: 0 0 5px 0; text-transform: uppercase; }
                    h2 { font-size: 12px; margin: 0 0 5px 0; color: #111; font-weight: bold; }
                    h3 { font-size: 10px; margin: 0; color: #4b5563; }
                    .info { display: flex; justify-content: space-between; font-size: 9px; margin-bottom: 15px; background: #f8fafc; padding: 10px; border-radius: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed; }
                    th { background: #f3f4f6; color: #1f2937; padding: 6px; text-align: center; border: 1px solid #9ca3af; font-size: 9px; text-transform: uppercase; font-weight: bold; }
                    td { padding: 5px; border: 1px solid #d1d5db; word-wrap: break-word; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .total-row { font-weight: bold; background: #f3f4f6; }
                    .page-break { page-break-before: always; }
                    .font-bold { font-weight: bold; }
                </style>
            </head>
            <body>
                <!-- PÁGINA 1: PROFORMA -->
                <div class="header-container">
                    <img src="/logo-codel.jpg" class="logo" />
                    <div class="header-text">
                        <h1>PROFORMA DE ATENCION ODONTOLOGICA</h1>
                        <h2>${proforma.periodo || '---'}</h2>
                        <h3>Dr. Ivan Alvaro Lima Huanca</h3>
                    </div>
                </div>

                <div class="info">
                    <div><strong>PROFORMA N°:</strong> ${proforma.id.toString().padStart(5, '0')}</div>
                    <div><strong>FECHA EMISIÓN:</strong> ${formatDate(proforma.fecha)}</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width:4%">No</th>
                            <th style="width:22%">APELLIDOS Y NOMBRE</th>
                            <th style="width:14%">MATRICULAS</th>
                            <th style="width:10%">FECHA</th>
                            <th style="width:10%">PIEZA</th>
                            <th style="width:30%">TRATAMIENTO</th>
                            <th style="width:10%">MONTO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${agrupados.map((grupo, gIdx) => 
                            grupo.tratamientos.map((t, tIdx) => `
                                <tr>
                                    <td class="text-center">${tIdx === 0 ? (gIdx + 1) + '.' : ''}</td>
                                    <td class="font-bold">${tIdx === 0 ? grupo.paciente : ''}</td>
                                    <td class="text-center">${tIdx === 0 ? grupo.matricula : ''}</td>
                                    <td class="text-center">${formatDate(t.fechaPlanilla || t.fecha)}</td>
                                    <td class="text-center">${t.pieza || ''}</td>
                                    <td>${t.arancel?.detalle || '-'}</td>
                                    <td class="text-right">${formatCurrency(t.precio, 'Bs')}</td>
                                </tr>
                            `).join('')
                        ).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="6" class="text-right">TOTAL PROFORMA:</td>
                            <td class="text-right">Bs. ${formatNumber(proforma.total)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="page-break"></div>

                <!-- PÁGINA 2: PLANILLA -->
                <div class="header-container">
                    <img src="/logo-codel.jpg" class="logo" />
                    <div class="header-text">
                        <h1>PLANILLA GENERAL DE ATENCION ODONTOLOGICA</h1>
                        <h2>${proforma.periodo || '---'}</h2>
                        <h3>Dr. Ivan Alvaro Lima Huanca</h3>
                    </div>
                </div>

                <div class="info">
                    <div><strong>PROFORMA ASOCIADA N°:</strong> ${proforma.id.toString().padStart(5, '0')}</div>
                    <div><strong>FECHA EMISIÓN:</strong> ${formatDate(proforma.fecha)}</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width:5%">#</th>
                            <th style="width:35%">PACIENTE</th>
                            <th style="width:15%">MATRÍCULA</th>
                            <th style="width:15%">ES TRABAJADOR</th>
                            <th style="width:15%">ES BENEFICIARIO</th>
                            <th style="width:15%" class="text-right">MONTO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${agrupados.map((grupo, index) => {
                            const firstT = grupo.tratamientos[0];
                            return `
                                <tr>
                                    <td class="text-center">${index + 1}</td>
                                    <td class="font-bold uppercase">${grupo.paciente}</td>
                                    <td class="text-center">${grupo.matricula}</td>
                                    <td class="text-center">${firstT.pacienteSeguro?.es_trabajador ? 'SI' : 'NO'}</td>
                                    <td class="text-center">${firstT.pacienteSeguro?.es_beneficiario ? 'SI' : 'NO'}</td>
                                    <td class="text-right font-bold">${formatCurrency(grupo.subtotal, 'Bs')}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="5" class="text-right">TOTAL PLANILLA:</td>
                            <td class="text-right">Bs. ${formatNumber(proforma.total)}</td>
                        </tr>
                    </tfoot>
                </table>

                ${proforma.detalles.some(t => {
                    const treatmentHistory = allHistory.filter(h => h.pacienteSeguroId === t.pacienteSeguroId && h.arancelId === t.arancelId && h.pieza === t.pieza && h.imagen);
                    return treatmentHistory.length > 0;
                }) ? `
                    <div class="page-break"></div>
                    <div class="header-container">
                        <img src="/logo-codel.jpg" class="logo" />
                        <div class="header-text">
                            <h1>REGISTRO DE SEGUIMIENTO RADIOGRÁFICO</h1>
                            <h2>${proforma.periodo || '---'}</h2>
                            <h3>Evolución Clínica: Inicio vs Final</h3>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr; gap: 25px;">
                        ${proforma.detalles.filter(t => {
                            const treatmentHistory = allHistory.filter(h => h.pacienteSeguroId === t.pacienteSeguroId && h.arancelId === t.arancelId && h.pieza === t.pieza && h.imagen);
                            return treatmentHistory.length > 0;
                        }).map(t => {
                            const treatmentHistory = allHistory
                                .filter(h => h.pacienteSeguroId === t.pacienteSeguroId && h.arancelId === t.arancelId && h.pieza === t.pieza && h.imagen)
                                .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime() || a.id - b.id);
                            
                            const firstImage = treatmentHistory[0];
                            const lastImage = treatmentHistory[treatmentHistory.length - 1];
                            const hasDifferentImages = firstImage.id !== lastImage.id;

                            return `
                                <div style="border: 2px solid #e5e7eb; padding: 15px; border-radius: 12px; page-break-inside: avoid; background: #fff;">
                                    <div style="background: #1e40af; padding: 10px 15px; margin: -15px -15px 15px -15px; border-radius: 10px 10px 0 0; color: white; line-height: 1.4;">
                                        <div style="font-size: 12px; font-weight: bold; text-transform: uppercase;">PACIENTE: ${formatFullName(t.pacienteSeguro)}</div>
                                        <div style="font-size: 11px; opacity: 0.9;">TRATAMIENTO: ${t.arancel?.detalle || '-'}</div>
                                        <div style="font-size: 11px; opacity: 0.9;">PIEZA: ${t.pieza || '-'}</div>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: ${hasDifferentImages ? '1fr 1fr' : '1fr'}; gap: 20px;">
                                        <div style="border: 1px solid #d1d5db; padding: 10px; border-radius: 8px; background: #f9fafb;">
                                            <div style="font-size: 10px; font-weight: bold; color: #1e40af; border-bottom: 1px solid #d1d5db; margin-bottom: 8px; padding-bottom: 4px; display: flex; justify-content: space-between;">
                                                <span>RADIOGRAFÍA DE INICIO</span>
                                                <span>FECHA: ${formatDate(firstImage.fecha)}</span>
                                            </div>
                                            <img src="${api.defaults.baseURL?.replace('/api', '')}${firstImage.imagen}" style="width: 100%; height: 220px; object-fit: contain; background: #000; border-radius: 4px;" />
                                            ${firstImage.imagen_descripcion ? `<div style="margin-top: 8px; font-size: 10px; color: #374151; background: #fff; padding: 6px; border: 1px solid #e5e7eb; border-left: 4px solid #10b981;"><strong>Descripción:</strong> ${firstImage.imagen_descripcion}</div>` : ''}
                                            ${firstImage.diagnostico ? `<div style="margin-top: 4px; font-size: 10px; color: #374151; background: #fff; padding: 6px; border: 1px solid #e5e7eb; border-left: 4px solid #10b981;"><strong>Diagnóstico:</strong> ${firstImage.diagnostico}</div>` : ''}
                                            ${firstImage.observaciones ? `<div style="margin-top: 4px; font-size: 10px; color: #374151; background: #fff; padding: 6px; border: 1px solid #e5e7eb; border-left: 4px solid #10b981;"><strong>Descripción del Trat. Realizado:</strong> ${firstImage.observaciones}</div>` : ''}
                                        </div>

                                        ${hasDifferentImages ? `
                                            <div style="border: 1px solid #d1d5db; padding: 10px; border-radius: 8px; background: #f9fafb;">
                                                <div style="font-size: 10px; font-weight: bold; color: #b91c1c; border-bottom: 1px solid #d1d5db; margin-bottom: 8px; padding-bottom: 4px; display: flex; justify-content: space-between;">
                                                    <span>RADIOGRAFÍA FINAL</span>
                                                    <span>FECHA: ${formatDate(lastImage.fechaPlanilla || lastImage.fecha)}</span>
                                                </div>
                                                <img src="${api.defaults.baseURL?.replace('/api', '')}${lastImage.imagen}" style="width: 100%; height: 220px; object-fit: contain; background: #000; border-radius: 4px;" />
                                                ${lastImage.imagen_descripcion ? `<div style="margin-top: 8px; font-size: 10px; color: #374151; background: #fff; padding: 6px; border: 1px solid #e5e7eb; border-left: 4px solid #b91c1c;"><strong>Descripción:</strong> ${lastImage.imagen_descripcion}</div>` : ''}
                                                ${lastImage.diagnostico ? `<div style="margin-top: 4px; font-size: 10px; color: #374151; background: #fff; padding: 6px; border: 1px solid #e5e7eb; border-left: 4px solid #b91c1c;"><strong>Diagnóstico:</strong> ${lastImage.diagnostico}</div>` : ''}
                                                ${lastImage.observaciones ? `<div style="margin-top: 4px; font-size: 10px; color: #374151; background: #fff; padding: 6px; border: 1px solid #e5e7eb; border-left: 4px solid #b91c1c;"><strong>Descripción del Trat. Realizado:</strong> ${lastImage.observaciones}</div>` : ''}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}

                <div style="margin-top: 80px; text-align: center; width: 100%; display: flex; justify-content: center;">
                    <div>
                        <div style="border-top: 1px solid #000; width: 200px; padding-top: 5px;">Firma Clínica</div>
                    </div>
                </div>
            </body>
            </html>
        `;

        doc.open();
        doc.write(printContent);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 500);
    };

    const exportToPDF = (proforma: ProformaSeguro = generatedProforma!) => {
        if (!proforma || !proforma.detalles) return;

        const doc = new jsPDF('p', 'mm', 'a4');
        const seguroName = 'PACIENTES CON SEGURO';
        
        doc.setFontSize(16);
        doc.setTextColor(30, 64, 175);
        doc.text('PROFORMA DE ATENCION ODONTOLOGICA', 105, 45, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(proforma.periodo || '---', 105, 52, { align: 'center' });
        doc.setFontSize(10);
        doc.text('Dr. Ivan Alvaro Lima Huanca', 105, 57, { align: 'center' });

        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Proforma N°: ${proforma.id.toString().padStart(5, '0')} - Fecha: ${formatDate(proforma.fecha)}`, 14, 65);

        // Tabla Detallada
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Detalle de Tratamientos:', 14, 72);

        const tableData = proforma.detalles.map((item: any, index: number) => [
            index + 1,
            formatDate(item.fechaPlanilla || item.fecha),
            formatFullName(item.pacienteSeguro),
            item.arancel?.detalle || '-',
            item.pieza || '-',
            item.cantidad,
            formatNumber(item.precio)
        ]);

        autoTable(doc, {
            head: [['#', 'Fecha', 'Paciente', 'Tratamiento', 'Pieza', 'Cant.', 'Total']],
            body: tableData,
            startY: 76,
            theme: 'striped',
            headStyles: { fillColor: [30, 64, 175] },
            styles: { fontSize: 8 },
        });

        let finalY = (doc as any).lastAutoTable.finalY || 36;

        // Tabla Agrupada (Planilla)
        doc.setFontSize(12);
        doc.text('Resumen Planilla (Por Paciente):', 14, finalY + 15);

        const agrupados = getAgrupadosPorPaciente(proforma.detalles);
        const planillaData = agrupados.map((grupo, index) => [
            index + 1,
            grupo.paciente,
            grupo.matricula,
            grupo.tratamientos.length,
            formatNumber(grupo.subtotal)
        ]);

        autoTable(doc, {
            head: [['#', 'Paciente', 'Matrícula', 'Tratamientos', 'Subtotal']],
            body: planillaData,
            startY: finalY + 20,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] }, // Emerald color
            styles: { fontSize: 9 },
            columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } }
        });

        finalY = (doc as any).lastAutoTable.finalY || finalY + 20;

        doc.setFontSize(12);
        doc.text(`TOTAL A PAGAR POR SEGURO: ${formatNumber(proforma.total)}`, 140, finalY + 15);

        doc.save(`Proforma_${proforma.id}_${seguroName}.pdf`);
    };

    return (
        <div className="content-card animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        Gestión de Proformas y Planillas
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Administre el cobro a las compañías aseguradoras.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowManual(true)}
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-1.5 rounded-full flex items-center justify-center w-[30px] h-[30px] text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
                        title="Ayuda / Manual"
                    >
                        ?
                    </button>
                </div>

                {generatedProforma && activeTab === 'generar' && (
                    <div className="flex gap-3 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center px-3 border-r border-blue-200 dark:border-blue-700">
                            <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
                                Proforma Generada N° {generatedProforma.numero_proforma || generatedProforma.id}
                            </span>
                        </div>
                        <button
                            onClick={() => handleImprimir()}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                        >
                            <Printer size={16} />
                            Imprimir
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 mb-6 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('generar')}
                    className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all whitespace-nowrap shadow-none border-none ${
                        activeTab === 'generar' 
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600' 
                        : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    <CheckSquare size={16} />
                    Generar Nueva Proforma
                </button>
                <button
                    onClick={() => setActiveTab('historial')}
                    className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all whitespace-nowrap shadow-none border-none ${
                        activeTab === 'historial' 
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600' 
                        : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    <History size={16} />
                    Historial de Proformas
                </button>
            </div>

            {activeTab === 'generar' ? (
                <>
            {/* Selection Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="w-full md:w-64 space-y-2">
                        <label className="block text-xs font-semibold text-blue-500 uppercase tracking-widest">1. Seleccionar Seguro</label>
                        <select
                            className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-800 dark:text-blue-300 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                            value={selectedSeguroId}
                            onChange={(e) => {
                                setSelectedSeguroId(e.target.value);
                                setSelectedIds(new Set()); 
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">-- ELIJA UN SEGURO --</option>
                            {seguros.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-64 space-y-2">
                        <label className="block text-xs font-semibold text-amber-500 uppercase tracking-widest">2. Periodo (Mes Año)</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="EJ. MAYO 2024"
                                className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300 font-bold focus:ring-2 focus:ring-amber-500/20 outline-none transition-all uppercase"
                                value={periodo}
                                onChange={(e) => setPeriodo(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-grow space-y-2">
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Búsqueda Rápida</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Paciente, Tratamiento..."
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={fetchData}
                            className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition-colors"
                            title="Actualizar lista"
                        >
                            <RefreshCw size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Action Bar */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSelectAll}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-transparent shadow-none border-none p-0"
                                >
                                {selectedIds.size === allFilteredData.length && allFilteredData.length > 0 ? (
                                    <><CheckSquare size={18} /> Desmarcar Todos</>
                                ) : (
                                    <><Square size={18} /> Seleccionar Todos</>
                                )}
                            </button>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest border-l border-gray-300 dark:border-gray-600 pl-4">
                                {selectedIds.size} seleccionados
                            </span>
                        </div>
                        {allFilteredData.length > 0 && (
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, allFilteredData.length)} de {allFilteredData.length} registros
                            </div>
                        )}
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <span className="text-xs font-semibold text-gray-500 uppercase block">Total Seleccionado</span>
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSeleccionado, 'Bs')}</span>
                            </div>
                            <button
                                onClick={handleGuardarProforma}
                                disabled={selectedIds.size === 0}
                                className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5 ${
                                    selectedIds.size > 0 
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 shadow-none'
                                }`}
                            >
                                <Save size={18} />
                                Generar Proforma
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-left border-collapse relative">
                            <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 text-center w-12 border-b border-gray-200 dark:border-gray-700"></th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">Fecha Real</th>
                                    <th className="px-4 py-3 text-xs font-bold text-blue-500 uppercase border-b border-gray-200 dark:border-gray-700">Fecha Planilla</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">Paciente</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">Matrícula</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">Tratamiento</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right border-b border-gray-200 dark:border-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {loading && allFilteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">Cargando tratamientos pendientes...</td>
                                    </tr>
                                ) : !selectedSeguroId ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                                                    <Shield size={40} className="text-blue-400" />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">Por favor, seleccione un seguro para ver los tratamientos disponibles.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : allFilteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-full">
                                                    <AlertCircle size={40} className="text-gray-300 dark:text-gray-600" />
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium">No hay tratamientos terminados pendientes de proforma para este seguro.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item) => {
                                        const isSelected = selectedIds.has(item.id);
                                        return (
                                            <tr 
                                                key={item.id} 
                                                onClick={() => handleToggleSelect(item.id)}
                                                className={`cursor-pointer transition-colors group ${
                                                    isSelected 
                                                    ? 'bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/40' 
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'
                                                }`}
                                            >
                                                <td className="px-4 py-3 text-center">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                        isSelected 
                                                        ? 'bg-blue-600 border-blue-600' 
                                                        : 'border-gray-300 bg-white group-hover:border-gray-400'
                                                    }`}>
                                                        {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 italic">
                                                    {formatDate(item.fecha)}
                                                </td>
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <input 
                                                        type="date"
                                                        value={editedDates[item.id] || item.fecha}
                                                        onChange={(e) => handleDateChange(item.id, e.target.value)}
                                                        className="px-2 py-1 text-xs border border-blue-200 dark:border-blue-800 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                                            {formatFullName(item.pacienteSeguro)}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                            {item.pacienteSeguro?.es_trabajador ? 'TRABAJADOR' : item.pacienteSeguro?.es_beneficiario ? 'BENEFICIARIO' : '---'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    {item.pacienteSeguro?.matricula_seguro || '---'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                            {item.arancel?.detalle || 'Tratamiento'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                                                            Cant: {item.cantidad} | Pieza: {item.pieza || '---'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                                                    {formatNumber(item.precio)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {allFilteredData.length > itemsPerPage && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center items-center gap-4">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    currentPage === 1 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                                    : 'bg-white dark:bg-gray-800 text-blue-600 hover:bg-blue-50 shadow-sm border border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                Anterior
                            </button>
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    currentPage === totalPages 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                                    : 'bg-white dark:bg-gray-800 text-blue-600 hover:bg-blue-50 shadow-sm border border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
                </>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Registro Histórico</h3>
                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Mostrando {filteredHistorial.length > 0 ? (historyPage - 1) * itemsPerPage + 1 : 0} - {Math.min(historyPage * itemsPerPage, filteredHistorial.length)} de {filteredHistorial.length} registros
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                            <span className="text-[10px] font-bold text-gray-400 uppercase px-2">Estado:</span>
                            {['todos', 'generada', 'pagada', 'anulada'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setHistoryStatusFilter(status);
                                        setHistoryPage(1);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                                        historyStatusFilter === status
                                        ? status === 'generada' ? 'bg-blue-600 text-white border-blue-600 shadow-md' :
                                          status === 'pagada' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' :
                                          status === 'anulada' ? 'bg-rose-600 text-white border-rose-600 shadow-md' :
                                          'bg-gray-800 text-white border-gray-800 shadow-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse font-inter">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-tight border-b border-gray-200 dark:border-gray-700">N° Proforma</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-tight border-b border-gray-200 dark:border-gray-700">Fecha</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-tight border-b border-gray-200 dark:border-gray-700">Periodo</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-tight border-b border-gray-200 dark:border-gray-700">Seguro</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-tight border-b border-gray-200 dark:border-gray-700">Total</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-tight border-b border-gray-200 dark:border-gray-700 text-center">Estado</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-tight border-b border-gray-200 dark:border-gray-700 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {paginatedHistorial.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No hay proformas que coincidan con el filtro.</td>
                                    </tr>
                                ) : paginatedHistorial.map(prof => (
                                    <tr key={prof.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                                            #{prof.numero_proforma || prof.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {formatDate(prof.fecha)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-black text-amber-700 dark:text-amber-400 uppercase">
                                            {prof.periodo || '---'}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {prof.seguro?.nombre || 'General'}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(prof.total, 'Bs')}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    prof.estado === 'generada' ? 'bg-blue-100 text-blue-700' :
                                                    prof.estado === 'pagada' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {prof.estado}
                                                </span>
                                                {prof.estado === 'pagada' && prof.fecha_pago && (
                                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                        {formatDate(prof.fecha_pago)}
                                                    </span>
                                                )}
                                                {prof.archivo_factura && (
                                                    <div className="flex flex-wrap gap-1 justify-center mt-1">
                                                        {prof.archivo_factura.split(',').map((path, idx) => (
                                                            <a 
                                                                key={idx}
                                                                href={`${api.defaults.baseURL?.replace('/api', '')}${path}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-1"
                                                                title={`Ver Factura ${idx + 1}`}
                                                            >
                                                                <Download size={12} />
                                                                {prof.archivo_factura!.split(',').length > 1 && (
                                                                    <span className="text-[9px] font-bold">{idx + 1}</span>
                                                                )}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                {prof.estado !== 'anulada' ? (
                                                    <>
                                                        <button 
                                                            onClick={() => {
                                                                setViewingProforma(prof);
                                                                setShowViewModal(true);
                                                            }}
                                                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95"
                                                            title="Ver Proforma"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => fetchAndImprimir(prof.id)}
                                                            className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95"
                                                            title="Imprimir"
                                                        >
                                                            <Printer size={18} />
                                                        </button>

                                                        {prof.estado === 'generada' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => {
                                                                        setProformaParaPagar(prof);
                                                                        setShowPagoModal(true);
                                                                    }}
                                                                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95"
                                                                    title="Registrar Pago"
                                                                >
                                                                    <Check size={18} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        setEditingProforma(prof);
                                                                        setShowEditModal(true);
                                                                    }}
                                                                    className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95"
                                                                    title="Editar"
                                                                >
                                                                    <Edit2 size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {prof.estado === 'generada' && (
                                                            <button 
                                                                onClick={() => handleAnular(prof.id)}
                                                                className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95"
                                                                title="Anular Proforma"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-xs font-bold text-rose-400 uppercase italic px-4">Anulada</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* History Pagination */}
                    {filteredHistorial.length > itemsPerPage && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center items-center gap-4">
                            <button
                                onClick={() => setHistoryPage(prev => Math.max(prev - 1, 1))}
                                disabled={historyPage === 1}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    historyPage === 1 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                                    : 'bg-white dark:bg-gray-800 text-blue-600 hover:bg-blue-50 shadow-sm border border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                Anterior
                            </button>
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                Página {historyPage} de {totalHistoryPages}
                            </span>
                            <button
                                onClick={() => setHistoryPage(prev => Math.min(prev + 1, totalHistoryPages))}
                                disabled={historyPage === totalHistoryPages}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                    historyPage === totalHistoryPages 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                                    : 'bg-white dark:bg-gray-800 text-blue-600 hover:bg-blue-50 shadow-sm border border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Vista Previa (Ver) */}
            {showViewModal && viewingProforma && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vista Previa de Proforma</h2>
                                <div className="flex items-center gap-4">
                                    <p className="text-sm text-gray-500">N° {viewingProforma.numero_proforma || viewingProforma.id} - {viewingProforma.periodo}</p>
                                    {viewingProforma.archivo_factura && (
                                        <a 
                                            href={`${api.defaults.baseURL?.replace('/api', '')}${viewingProforma.archivo_factura}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors flex items-center gap-1"
                                        >
                                            <Download size={14} /> VER FACTURA PDF
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto p-8 space-y-8">
                            {/* Proforma Page Header Mockup */}
                            <div className="border border-gray-100 dark:border-gray-700 p-8 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
                                <div className="flex justify-between items-start mb-8">
                                    <img src="/logo-codel.jpg" className="h-16 w-auto" alt="Logo" />
                                    <div className="text-right">
                                        <h3 className="text-lg font-bold text-blue-600">PROFORMA DE ATENCION ODONTOLOGICA</h3>
                                        <p className="font-bold text-gray-800 dark:text-gray-200">{viewingProforma.periodo}</p>
                                        <p className="text-sm text-gray-500 italic">Dr. Ivan Alvaro Lima Huanca</p>
                                    </div>
                                </div>

                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800">
                                            <th className="border border-gray-200 dark:border-gray-700 p-2 text-center w-10">No</th>
                                            <th className="border border-gray-200 dark:border-gray-700 p-2">PACIENTE</th>
                                            <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">MATRICULA</th>
                                            <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">FECHA</th>
                                            <th className="border border-gray-200 dark:border-gray-700 p-2">TRATAMIENTO</th>
                                            <th className="border border-gray-200 dark:border-gray-700 p-2 text-right">MONTO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewingProforma && getAgrupadosPorPaciente(viewingProforma.detalles || []).map((grupo, gIdx) => 
                                            grupo.tratamientos.map((t, tIdx) => (
                                                <tr key={t.id}>
                                                    <td className="border border-gray-200 dark:border-gray-700 p-2 text-center">{tIdx === 0 ? gIdx + 1 : ''}</td>
                                                    <td className="border border-gray-200 dark:border-gray-700 p-2 font-bold">{tIdx === 0 ? grupo.paciente : ''}</td>
                                                    <td className="border border-gray-200 dark:border-gray-700 p-2 text-center">{tIdx === 0 ? grupo.matricula : ''}</td>
                                                    <td className="border border-gray-200 dark:border-gray-700 p-2 text-center">{formatDate(t.fechaPlanilla || t.fecha)}</td>
                                                    <td className="border border-gray-200 dark:border-gray-700 p-2">{t.arancel?.detalle}</td>
                                                    <td className="border border-gray-200 dark:border-gray-700 p-2 text-right">{formatCurrency(t.precio, 'Bs')}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                                            <td colSpan={5} className="border border-gray-200 dark:border-gray-700 p-2 text-right uppercase">Total Proforma:</td>
                                            <td className="border border-gray-200 dark:border-gray-700 p-2 text-right text-blue-600">{formatCurrency(viewingProforma.total, 'Bs')}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/50">
                            <button 
                                onClick={() => setShowViewModal(false)}
                                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 shadow-sm"
                            >
                                <XCircle size={18} /> CERRAR
                            </button>
                            <button 
                                onClick={() => {
                                    setShowViewModal(false);
                                    fetchAndImprimir(viewingProforma.id);
                                }}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                            >
                                <Printer size={18} /> IMPRIMIR AHORA
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición */}
            {showEditModal && editingProforma && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-amber-50/50 dark:bg-amber-900/20">
                            <div>
                                <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                                    <Edit2 size={20} /> Editar Contenido de Proforma
                                </h2>
                                <div className="flex items-center gap-4 mt-1">
                                    <p className="text-sm text-amber-600/70 font-bold">N° {editingProforma?.numero_proforma || editingProforma?.id}</p>
                                    <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-3 py-1 rounded-lg border border-amber-200/50 dark:border-amber-900/30 shadow-inner">
                                        <span className="text-[10px] font-bold text-amber-700/50 dark:text-amber-500/50 uppercase">Periodo:</span>
                                        <input 
                                            type="text"
                                            value={editingProforma.periodo || ''}
                                            onChange={(e) => handleUpdatePeriodo(editingProforma.id, e.target.value)}
                                            className="bg-transparent border-none focus:ring-0 text-xs font-black text-amber-900 dark:text-amber-200 uppercase w-32 placeholder:text-amber-300"
                                            placeholder="EJ. MAYO 2024"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto p-6">
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl mb-6 flex items-center gap-3 text-amber-800 dark:text-amber-300 text-sm">
                                <AlertCircle size={18} />
                                <p>Al eliminar un tratamiento de esta lista, volverá a estar disponible en la pestaña "Generar Proforma".</p>
                            </div>

                            <div className="space-y-4">
                                {!editingProforma?.detalles || editingProforma.detalles.length === 0 ? (
                                    <p className="text-center py-10 text-gray-500">No hay tratamientos en esta proforma.</p>
                                ) : (
                                    editingProforma.detalles.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-amber-200 transition-colors group">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white uppercase text-sm">
                                                    {formatFullName(t.pacienteSeguro)}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Planilla:</span>
                                                    <input 
                                                        type="date"
                                                        value={t.fechaPlanilla || t.fecha}
                                                        onChange={(e) => handleUpdateFechaPlanilla(editingProforma!.id, t.id, e.target.value)}
                                                        className="px-2 py-0.5 text-[10px] border border-blue-200 dark:border-blue-800 rounded bg-blue-50/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                                                    />
                                                    <span className="text-[10px] text-gray-400 font-bold px-2">|</span>
                                                    <span className="text-[10px] text-gray-500 font-medium">
                                                        {t.arancel?.detalle}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-emerald-600">{formatCurrency(t.precio, 'Bs')}</span>
                                                <button 
                                                    onClick={() => handleRemoverTratamiento(editingProforma!.id, t.id)}
                                                    className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
                                                    title="Eliminar de Proforma"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Sección para agregar tratamientos */}
                            <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Plus size={16} className="text-emerald-500" /> Agregar Tratamientos Disponibles
                                </h3>
                                
                                <div className="space-y-3">
                                    {registros.filter(r => 
                                        r.pacienteSeguro?.seguro?.id === editingProforma.seguro?.id && 
                                        !editingProforma.detalles?.some(d => d.id === r.id)
                                    ).length === 0 ? (
                                        <p className="text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl text-center">
                                            No hay más tratamientos pendientes para este seguro.
                                        </p>
                                    ) : (
                                        registros.filter(r => 
                                            r.pacienteSeguro?.seguro?.id === editingProforma.seguro?.id && 
                                            !editingProforma.detalles?.some(d => d.id === r.id)
                                        ).map(r => (
                                            <div key={r.id} className="flex items-center justify-between p-3 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/30 hover:border-blue-300 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 dark:text-gray-200 uppercase text-xs">
                                                        {formatFullName(r.pacienteSeguro)}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">
                                                        {r.arancel?.detalle} | {formatDate(r.fecha)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-blue-600">{formatCurrency(r.precio, 'Bs')}</span>
                                                    <button 
                                                        onClick={() => handleAgregarTratamiento(editingProforma.id, r.id)}
                                                        className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
                                                        title="Agregar a Proforma"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="text-right">
                                <span className="text-xs text-gray-400 uppercase block">Total Actual</span>
                                <span className="text-xl font-bold text-emerald-600">{formatCurrency(editingProforma?.total || 0, 'Bs')}</span>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => {
                                        setEditingProforma(null);
                                        setShowEditModal(false);
                                    }}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                                >
                                    <XCircle size={20} /> CANCELAR
                                </button>
                                <button 
                                    onClick={handleFinalizarEdicion}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                                >
                                    <Check size={20} /> FINALIZAR EDICIÓN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Registro de Pago */}
            {showPagoModal && proformaParaPagar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/50 dark:bg-emerald-900/20">
                            <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                                <Check size={24} /> Registrar Pago de Seguro
                            </h2>
                            <p className="text-sm text-emerald-600/70 italic">Proforma N° {proformaParaPagar.numero_proforma || proformaParaPagar.id}</p>
                        </div>

                        <div className="p-6 space-y-5 font-sans">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha de Pago</label>
                                <input 
                                    type="date"
                                    value={pagoData.fecha_pago}
                                    onChange={(e) => setPagoData({...pagoData, fecha_pago: e.target.value})}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Forma de Pago</label>
                                <div className="flex gap-2">
                                    <select 
                                        value={pagoData.formaPagoId}
                                        onChange={(e) => setPagoData({...pagoData, formaPagoId: e.target.value})}
                                        className="flex-grow px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-sans"
                                    >
                                        <option value="">Seleccione...</option>
                                        {formasPago.map(f => (
                                            <option key={f.id} value={f.id}>{f.forma_pago}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={handleCrearFormaPago}
                                        className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
                                        title="Nueva Forma de Pago"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Facturas del Seguro (PDF)</label>
                                <div className="relative group">
                                    <input 
                                        type="file"
                                        accept=".pdf"
                                        multiple
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setPagoData({...pagoData, archivos: Array.from(e.target.files)});
                                            }
                                        }}
                                        className="hidden"
                                        id="factura-upload"
                                    />
                                    <label 
                                        htmlFor="factura-upload"
                                        className={`w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                            pagoData.archivos.length > 0 
                                            ? 'border-emerald-500 bg-emerald-50/30 text-emerald-700' 
                                            : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 text-gray-500'
                                        }`}
                                    >
                                        <Download size={24} className="mb-2" />
                                        <span className="text-sm font-bold text-center font-sans">
                                            {pagoData.archivos.length > 0 
                                                ? `${pagoData.archivos.length} archivo(s) seleccionado(s)` 
                                                : 'Seleccionar Archivo(s) PDF'}
                                        </span>
                                        {pagoData.archivos.length > 0 && (
                                            <div className="mt-2 text-[10px] text-gray-500 max-h-20 overflow-y-auto w-full px-4">
                                                {pagoData.archivos.map((f, i) => (
                                                    <div key={i} className="truncate">• {f.name}</div>
                                                ))}
                                            </div>
                                        )}
                                        <span className="text-[10px] uppercase mt-1 opacity-60 font-sans">Al menos uno requerido</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
                            <button 
                                onClick={() => setShowPagoModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 font-sans shadow-sm"
                            >
                                <XCircle size={18} /> CANCELAR
                            </button>
                            <button 
                                onClick={handleConfirmarPago}
                                disabled={pagoData.archivos.length === 0 || !pagoData.formaPagoId}
                                className={`flex-1 px-4 py-3 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 font-sans ${
                                    pagoData.archivos.length > 0 && pagoData.formaPagoId
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                }`}
                            >
                                <Save size={18} /> CONFIRMAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ManualModal 
                isOpen={showManual}
                onClose={() => setShowManual(false)}
                title="Ayuda: Gestión de Proformas y Planillas"
                sections={manualSections}
            />
        </div>
    );
};

export default PlanillasProformasSeguro;
