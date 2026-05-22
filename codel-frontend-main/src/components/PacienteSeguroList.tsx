import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Pagination from './Pagination';
import ManualModal, { type ManualSection } from './ManualModal';
import { formatDate } from '../utils/dateUtils';
import { formatFullName } from '../utils/formatters';
import Swal from 'sweetalert2';
import { FileText, Download, Printer, Users, Plus, Edit, Trash2, CheckCircle, Shield, PenTool } from 'lucide-react';
import type { Paciente } from '../types';
import SignatureModal from './SignatureModal';

const PacienteSeguroList: React.FC = () => {
    const [pacientes, setPacientes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [showManual, setShowManual] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [selectedPacienteId, setSelectedPacienteId] = useState<number | null>(null);
    const limit = 10;
    const navigate = useNavigate();

    const manualSections: ManualSection[] = [
        {
            title: 'Pacientes de Seguro',
            content: 'Registro especializado para pacientes con cobertura de seguros o convenios.'
        },
        {
            title: 'Gestión de Seguros',
            content: 'Puede ver el plan del seguro, la póliza y el responsable asociado a cada paciente.'
        },
        {
            title: 'Acciones Rápidas',
            content: 'Use los botones de la derecha para editar la información o cambiar el estado del paciente (Activo/Inactivo).'
        }
    ];

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const calcularEdad = (fecha_nacimiento: string | undefined): string => {
        if (!fecha_nacimiento) return '';
        const hoy = new Date();
        const nacimiento = new Date(fecha_nacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
        return `${edad} años`;
    };

    const formatCelular = (celular: string) => {
        if (!celular) return '---';
        const countryCodes = ['+591', '+54', '+55', '+56', '+51', '+595', '+598', '+57', '+52', '+34', '+1'];
        const code = countryCodes.find(c => celular && celular.startsWith(c));
        if (code) {
            const number = celular.substring(code.length);
            return `(${code}) ${number}`;
        }
        return celular;
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchInput);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchInput]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchPacientes();
    }, [currentPage, debouncedSearchTerm]);

    const fetchPacientes = async () => {
        try {
            const response = await api.get(`/pacientes-seguro?page=${currentPage}&limit=${limit}&search=${debouncedSearchTerm}`);
            setPacientes(response.data.data || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalRecords(response.data.total || 0);
        } catch (error) {
            console.error('Error fetching insurance patients:', error);
            setPacientes([]);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Dar de baja?',
            text: "El estado cambiará a inactivo",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, dar de baja',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.patch(`/pacientes-seguro/${id}/disable`);
                fetchPacientes();
                Swal.fire({
                    icon: 'success',
                    title: '¡Dado de baja!',
                    text: 'El paciente está inactivo.',
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch (error) {
                Swal.fire('Error', 'No se pudo realizar la acción', 'error');
            }
        }
    };

    const handleReactivate = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Reactivar paciente?',
            text: 'El paciente volverá a estado Activo.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, reactivar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.patch(`/pacientes-seguro/${id}/enable`);
                fetchPacientes();
                Swal.fire({
                    icon: 'success',
                    title: '¡Paciente reactivado!',
                    text: 'El estado del paciente ha sido cambiado a Activo.',
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch (error) {
                Swal.fire('Error', 'No se pudo reactivar', 'error');
            }
        }
    };

    const exportToExcel = async () => {
        try {
            Swal.fire({ title: 'Generando Excel...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const response = await api.get(`/pacientes-seguro?page=1&limit=9999&search=${debouncedSearchTerm}`);
            const all = response.data.data || [];
            const data = all.map((p: any) => ({
                Paciente: formatFullName(p),
                Matrícula: p.matricula_seguro || '-',
                Estado: p.estado
            }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "PacientesSeguro");
            XLSX.writeFile(wb, "pacientes_seguro.xlsx");
            Swal.close();
        } catch (error) {
            Swal.fire('Error', 'No se pudo generar el Excel', 'error');
        }
    };

    const exportToPDF = async () => {
        try {
            Swal.fire({ title: 'Generando PDF...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const response = await api.get(`/pacientes-seguro?page=1&limit=9999&search=${debouncedSearchTerm}`);
            const all = response.data.data || [];
            const doc = new jsPDF();
            doc.text("Lista de Pacientes de Seguro", 20, 10);
            autoTable(doc, {
                head: [["Paciente", "Matrícula", "Estado"]],
                body: all.map((p: any) => [formatFullName(p), p.matricula_seguro || '-', p.estado]),
                startY: 20,
            });
            doc.save("pacientes_seguro.pdf");
            Swal.close();
        } catch (error) {
            Swal.fire('Error', 'No se pudo generar el PDF', 'error');
        }
    };

    const handlePrint = async () => {
        try {
            const response = await api.get(`/pacientes-seguro?page=1&limit=9999&search=${debouncedSearchTerm}`);
            const all = response.data.data || [];

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

            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Lista de Pacientes de Seguro</title>
                    <style>
                        @page { size: A4; margin: 2cm; }
                        body { font-family: Arial, sans-serif; font-size: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #f3f4f6; padding: 8px; text-align: left; border: 1px solid #ddd; }
                        td { padding: 8px; border: 1px solid #ddd; }
                        h1 { color: #1e40af; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>Lista de Pacientes de Seguro</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Paciente</th>
                                <th>Matrícula</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${all.map((p: any, i: number) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${formatFullName(p)}</td>
                                    <td>${p.matricula_seguro || '-'}</td>
                                    <td>${p.estado}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            doc.open();
            doc.write(printContent);
            doc.close();

            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                document.body.removeChild(iframe);
            }, 500);
        } catch (error) {
            console.error('Print error:', error);
        }
    };

    const handlePrintPaciente = async (pacientePreview: any) => {
        try {
            Swal.fire({ title: 'Generando Ficha...', text: 'Por favor espere', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const response = await api.get(`/pacientes-seguro/${pacientePreview.id}`);
            const fullPaciente = response.data;
            let signatures: any[] = [];
            try {
                const resHC = await api.get(`/firmas/documento/paciente_seguro/${fullPaciente.id}`);
                signatures = Array.isArray(resHC.data) ? resHC.data : [];
            } catch (error) { console.error('Error fetching signatures:', error); }
            const patientSignature = signatures.filter(s => s.rolFirmante === 'paciente').pop();
            const checkIcon = (val: boolean | undefined) => val ? '☑' : '☐';
            const renderSiNo = (val: boolean | undefined) => {
                const isTrue = !!val;
                return `<span class="checkbox-icon">${isTrue ? '☑' : '☐'}</span> SÍ &nbsp;|&nbsp; <span class="checkbox-icon">${!isTrue ? '☑' : '☐'}</span> NO`;
            };
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0';
            document.body.appendChild(iframe);
            const doc = iframe.contentWindow?.document;
            if (!doc) { document.body.removeChild(iframe); throw new Error('Error iframe'); }
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Historia Clínica - ${formatFullName(fullPaciente)}</title>
                    <style>
                        @page { 
                            size: A4; 
                            margin: 1cm; 
                        }
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            margin: 0; 
                            padding: 0; 
                            color: #333; 
                            line-height: 1.3; 
                            font-size: 10px; 
                        }
                        .page-container { 
                            width: 100%; 
                            box-sizing: border-box; 
                            display: flex; 
                            flex-direction: column; 
                            min-height: 270mm;
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 15px; 
                            border-bottom: 2px solid #9333ea; 
                            padding-bottom: 8px; 
                        }
                        h1 { color: #6b21a8; margin: 0; font-size: 18px; text-transform: uppercase; }
                        h2 { 
                            background: #f5f3ff; 
                            color: #6b21a8; 
                            padding: 4px 10px; 
                            margin-top: 12px; 
                            margin-bottom: 8px;
                            font-size: 12px; 
                            text-transform: uppercase; 
                            border-left: 4px solid #9333ea; 
                        }
                        .info-grid { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr 1fr; 
                            gap: 8px; 
                            margin-top: 5px; 
                        }
                        .field { border-bottom: 1px solid #f3f4f6; padding: 3px 0; }
                        .label { font-weight: bold; color: #6b7280; font-size: 8px; text-transform: uppercase; display: block; }
                        .value { font-size: 10px; color: #111827; min-height: 12px; }
                        
                        .checkbox-grid { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr; 
                            gap: 15px; 
                            margin-top: 5px; 
                        }
                        .checkbox-table { width: 100%; border-collapse: collapse; }
                        .checkbox-table td { padding: 3px; border-bottom: 1px solid #f9fafb; }
                        .checkbox-icon { font-size: 12px; margin-right: 5px; color: #9333ea; font-weight: bold; }
                        
                        .diseases-table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-top: 5px; 
                            margin-bottom: 10px; 
                        }
                        .diseases-table th { 
                            background: #f5f3ff; 
                            color: #6b21a8; 
                            padding: 5px 8px; 
                            font-size: 9px; 
                            font-weight: bold; 
                            text-transform: uppercase; 
                            border: 1px solid #e5e7eb; 
                            text-align: left; 
                        }
                        .diseases-table td { 
                            padding: 5px 8px; 
                            border: 1px solid #e5e7eb; 
                            font-size: 9px; 
                        }
                        .diseases-table tr:nth-child(even) { 
                            background: #f9fafb; 
                        }
                        
                        .signature-section {
                            margin-top: auto;
                            padding-top: 30px;
                            display: flex;
                            justify-content: center;
                            width: 100%;
                        }
                        .signature-box { 
                            text-align: center; 
                            width: 250px; 
                        }
                        .sig-line { border-top: 1px solid #374151; margin-top: 0px; }
                        
                        .footer { 
                            margin-top: 10px;
                            font-size: 8px; 
                            color: #9ca3af; 
                            border-top: 1px solid #e5e7eb; 
                            padding-top: 5px; 
                            display: flex; 
                            justify-content: space-between; 
                        }
                        .detail-text {
                            font-size: 9px;
                            color: #4b5563;
                            margin-top: 2px;
                            font-style: italic;
                        }
                        @media print {
                            .page-container { min-height: auto; }
                            h2 { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            .page-break { page-break-before: always; }
                        }
                    </style>
                </head>
                <body>
                    <div class="page-container">
                        <div class="header">
                            <h1>Historia Clínica Odontológica (Seguro)</h1>
                            <div style="font-size: 10px; color: #666;">Seguro: ${fullPaciente.seguro?.nombre || 'Particular/Seguro'} | Fecha de Registro: ${fullPaciente.fecha_ingreso ? formatDate(fullPaciente.fecha_ingreso) : '-'}</div>
                        </div>

                        <h2>Filiación del Paciente</h2>
                        <div class="info-grid">
                            <div class="field"><span class="label">Aseguradora</span><div class="value">${fullPaciente.seguro?.nombre || '-'}</div></div>
                            <div class="field"><span class="label">Matrícula Seguro</span><div class="value">${fullPaciente.matricula_seguro || '-'}</div></div>
                            <div class="field"><span class="label">Relación</span><div class="value">${fullPaciente.es_trabajador ? 'Trabajador' : fullPaciente.es_beneficiario ? 'Beneficiario' : '-'}</div></div>

                            <div class="field"><span class="label">Paterno</span><div class="value">${fullPaciente.paterno || '-'}</div></div>
                            <div class="field"><span class="label">Materno</span><div class="value">${fullPaciente.materno || '-'}</div></div>
                            <div class="field"><span class="label">Nombres</span><div class="value">${fullPaciente.nombre || '-'}</div></div>

                            <div class="field"><span class="label">CI</span><div class="value">${fullPaciente.ci || '-'}</div></div>
                            <div class="field"><span class="label">Fecha Nacimiento</span><div class="value">${formatDate(fullPaciente.fecha_nacimiento) || '-'}</div></div>
                            <div class="field"><span class="label">Edad</span><div class="value">${calcularEdad(fullPaciente.fecha_nacimiento)}</div></div>

                            <div class="field"><span class="label">Género</span><div class="value">${fullPaciente.genero || '-'}</div></div>
                            <div class="field"><span class="label">Celular</span><div class="value">${fullPaciente.celular || '-'}</div></div>
                            <div class="field"><span class="label">Teléfono Fijo</span><div class="value">${fullPaciente.telefono || '-'}</div></div>

                            <div class="field"><span class="label">Fecha Ingreso</span><div class="value">${formatDate(fullPaciente.fecha_ingreso)}</div></div>
                            <div class="field"><span class="label">Altura</span><div class="value">${fullPaciente.altura ? `${fullPaciente.altura} cm` : '-'}</div></div>
                            <div class="field"><span class="label">Peso</span><div class="value">${fullPaciente.peso ? `${fullPaciente.peso} kg` : '-'}</div></div>

                            <div class="field" style="grid-column: span 3;"><span class="label">Dirección</span><div class="value">${fullPaciente.direccion || '-'}</div></div>
                        </div>

                        <h2>Información Clínica y Consulta</h2>
                        <div class="info-grid">
                            <div class="field" style="grid-column: span 3;"><span class="label">Motivo de Consulta</span><div class="value">${fullPaciente.fichaClinica?.motivo_consulta || '-'}</div></div>
                            <div class="field" style="grid-column: span 2;"><span class="label">Motivo Visita Anterior</span><div class="value">${fullPaciente.fichaClinica?.motivo_visita_anterior || '-'}</div></div>
                            <div class="field"><span class="label">Fecha Última Visita</span><div class="value">${fullPaciente.fichaClinica?.fecha_ultima_visita || '-'}</div></div>
                        </div>

                        <h2>Antecedentes Generales</h2>
                        <table class="diseases-table">
                            <thead>
                                <tr>
                                    <th style="width: 35%;">ANTECEDENTES GENERALES</th>
                                    <th style="width: 15%; text-align: center;">SÍ | NO</th>
                                    <th style="width: 50%;">DETALLE / ESPECIFICACIÓN</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Complicaciones Dentales</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.complicaciones)}</td>
                                    <td>${fullPaciente.fichaClinica?.complicaciones_detalle || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Tratamiento Médico Actual</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.tratamiento_medico_actual)}</td>
                                    <td>${fullPaciente.fichaClinica?.tratamiento_medico_enfermedad || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Toma Medicamentos</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.toma_medicamento)}</td>
                                    <td>${fullPaciente.fichaClinica?.medicamento_detalle || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Alergias a Medicamentos</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.alergia_medicamento)}</td>
                                    <td>${fullPaciente.fichaClinica?.alergia_medicamento_detalle || '-'}</td>
                                </tr>
                            </tbody>
                        </table>

                        <h2>Listado de Enfermedades</h2>
                        <table class="diseases-table">
                            <thead>
                                <tr>
                                    <th style="width: 35%;">ENFERMEDADES</th>
                                    <th style="width: 15%; text-align: center;">SÍ | NO</th>
                                    <th style="width: 50%;">TRATAMIENTO</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Epilepsia o Convulsiones</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.enf_epilepsia)}</td>
                                    <td>${fullPaciente.fichaClinica?.enf_epilepsia_tratamiento || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Anemia</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.enf_anemia)}</td>
                                    <td>${fullPaciente.fichaClinica?.enf_anemia_tratamiento || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Diabetes</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.enf_diabetes)}</td>
                                    <td>${fullPaciente.fichaClinica?.enf_diabetes_tratamiento || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Hiper o Hipotiroidismo</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.enf_tiroidismo)}</td>
                                    <td>${fullPaciente.fichaClinica?.enf_tiroidismo_tratamiento || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Hipertensión Arterial</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.enf_hipertension)}</td>
                                    <td>${fullPaciente.fichaClinica?.enf_hipertension_tratamiento || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Infarto al miocardio</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.enf_infarto)}</td>
                                    <td>${fullPaciente.fichaClinica?.enf_infarto_tratamiento || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Asma</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.enf_asma)}</td>
                                    <td>${fullPaciente.fichaClinica?.enf_asma_tratamiento || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Insuficiencia renal</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.enf_renal)}</td>
                                    <td>${fullPaciente.fichaClinica?.enf_renal_tratamiento || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Gastritis</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.enf_gastritis)}</td>
                                    <td>${fullPaciente.fichaClinica?.enf_gastritis_tratamiento || '-'}</td>
                                </tr>
                                <tr>
                                    <td>Otros</td>
                                    <td style="text-align: center;">${renderSiNo(fullPaciente.fichaClinica?.enf_otros)}</td>
                                    <td>${fullPaciente.fichaClinica?.enf_otros_tratamiento || fullPaciente.fichaClinica?.enf_otros_detalle || '-'}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="page-break"></div>
                        <h2>Examen Clínico</h2>
                        <div class="info-grid">
                            <div class="field" style="grid-column: span 3;"><span class="label">Examen Extraoral</span><div class="value">${fullPaciente.fichaClinica?.examen_clinico_extraoral || '-'}</div></div>
                            <div class="field" style="grid-column: span 3;"><span class="label">Particularidades</span><div class="value">${fullPaciente.fichaClinica?.particularidad || '-'}</div></div>
                        </div>

                        <div class="signature-section">
                            <div class="signature-box">
                                 ${patientSignature ? `
                                     <img src="${patientSignature.firmaData}" style="max-height: 80px; margin-bottom: 2px; position: relative; z-index: 1;" />
                                 ` : '<div style="height: 70px;"></div>'}
                                <div class="sig-line"></div>
                                <div style="font-weight: bold; margin-top: 5px;">${formatFullName(fullPaciente)}</div>
                                <div style="font-size: 9px; color: #666;">Firma del Paciente</div>
                            </div>
                        </div>

                        <div class="footer">
                            <div>Sistema de Gestión Odontológica CODEL</div>
                            <div>Fecha Impresión: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                </body>
                </html>
            `;
            doc.open(); doc.write(printContent); doc.close();

            const images = Array.from(doc.querySelectorAll('img'));
            let printTriggered = false;

            const doPrint = () => {
                if (printTriggered) return;
                printTriggered = true;
                if (Swal.isVisible()) Swal.close();
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                    document.body.removeChild(iframe);
                }, 500);
            };

            if (images.length === 0) {
                doPrint();
            } else {
                let loadedCount = 0;
                images.forEach(img => {
                    img.onload = () => {
                        loadedCount++;
                        if (loadedCount === images.length) doPrint();
                    };
                    img.onerror = () => {
                        loadedCount++;
                        if (loadedCount === images.length) doPrint();
                    };
                });
                // Safety timeout
                setTimeout(doPrint, 3000);
            }
        } catch (error) { Swal.fire('Error', 'No se pudo imprimir', 'error'); }
    };

    return (
        <div className="content-card transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        Pacientes de Seguro
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Listado especializado para pacientes con convenios y pólizas de seguro.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setShowManual(true)}
                        className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-1.5 rounded-full flex items-center justify-center w-[30px] h-[30px] text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
                        title="Ayuda / Manual"
                    >
                        ?
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="bg-[#28a745] hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-md transition-all transform hover:-translate-y-0.5 gap-2"
                        title="Exportar a Excel"
                    >
                        <FileText size={18} />
                        <span className="text-sm font-bold">Excel</span>
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="bg-[#dc3545] hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-md transition-all transform hover:-translate-y-0.5 gap-2"
                        title="Exportar a PDF"
                    >
                        <Download size={18} />
                        <span className="text-sm font-bold">PDF</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center shadow-md transition-all transform hover:-translate-y-0.5 gap-2"
                        title="Imprimir Lista"
                    >
                        <Printer size={18} />
                        <span className="text-sm font-bold">Imprimir</span>
                    </button>

                    <div className="hidden md:block h-8 w-[1px] bg-gray-300 dark:bg-gray-600 mx-1"></div>

                    <button
                        onClick={() => navigate('/pacientes-seguro/create')}
                        className="inline-flex items-center px-5 py-2.5 bg-[#3498db] hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all transform hover:-translate-y-0.5 active:scale-95 gap-2"
                    >
                        <Plus size={20} />
                        Nuevo Paciente Seguro
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 no-print">
                <div className="flex gap-2 w-full md:max-w-md">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, CI o Nro Historia..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-800 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    {searchInput && (
                        <button
                            onClick={() => setSearchInput('')}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                Mostrando {totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, totalRecords)} de {totalRecords} registros
            </div>

            <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paciente</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Matrícula</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Celular</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha Nacimiento</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Firma</th>
                            <th className="no-print px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {pacientes.map((p, index) => (
                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-6 py-4 text-gray-800 dark:text-gray-300 text-sm">{(currentPage - 1) * limit + index + 1}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span 
                                            className="font-bold cursor-pointer text-blue-600 hover:text-blue-800 hover:underline transition-all uppercase text-sm"
                                            onClick={() => navigate(`/pacientes-seguro/${p.id}/ficha`)}
                                        >
                                            {formatFullName(p)}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                                            {p.es_trabajador ? 'Es Trabajador' : p.es_beneficiario ? 'Es Beneficiario' : '---'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase">{p.matricula_seguro || '---'}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(p.fecha_ingreso)}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{formatCelular(p.celular)}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                    {formatDate(p.fecha_nacimiento)}
                                    {p.fecha_nacimiento && (
                                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({calcularEdad(p.fecha_nacimiento)})</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-sm ${
                                        p.estado === 'activo'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    }`}>
                                        {p.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        {p.esta_firmado ? (
                                            <div className="flex items-center text-green-600 dark:text-green-400 font-bold" title="Ficha Clínica Firmada">
                                                <CheckCircle size={20} className="mr-1" />
                                                <span className="text-xs">Firmado</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedPacienteId(p.id);
                                                    setShowSignatureModal(true);
                                                }}
                                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all transform hover:-translate-y-0.5"
                                                title="Firmar Ficha Clínica"
                                            >
                                                <PenTool size={20} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => handlePrintPaciente(p)}
                                            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
                                            title="Imprimir Ficha"
                                        >
                                            <Printer size={20} />
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/pacientes-seguro/edit/${p.id}`)}
                                            className="p-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
                                            title="Editar"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        {p.estado === 'activo' ? (
                                            <button 
                                                onClick={() => handleDelete(p.id)}
                                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
                                                title="Dar de baja"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleReactivate(p.id)}
                                                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all transform hover:-translate-y-0.5"
                                                title="Reactivar"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {pacientes.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-10 text-center text-gray-400 dark:text-gray-600 italic">
                                    No se encontraron pacientes de seguro
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <ManualModal 
                isOpen={showManual}
                onClose={() => setShowManual(false)}
                title="Manual: Pacientes de Seguro"
                sections={manualSections}
            />

            {showSignatureModal && selectedPacienteId && (
                <SignatureModal
                    isOpen={showSignatureModal}
                    onClose={() => {
                        setShowSignatureModal(false);
                        setSelectedPacienteId(null);
                    }}
                    tipoDocumento="paciente_seguro"
                    documentoId={selectedPacienteId}
                    rolFirmante="paciente"
                    onSuccess={() => {
                        fetchPacientes();
                    }}
                />
            )}
        </div>
    );
};

export default PacienteSeguroList;
