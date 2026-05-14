import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import Odontogram from './Odontogram';
import { Shield, Edit, Save, X, History, Clock, Printer, HelpCircle, RotateCcw, ClipboardList, ArrowLeft } from 'lucide-react';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import ManualModal from './ManualModal';
import type { ManualSection } from './ManualModal';
import ExamenDentalLiterario from './ExamenDentalLiterario';


interface PacienteTabOdontogramaProps {
    tipo: 'particular' | 'seguro';
}

const PacienteTabOdontograma: React.FC<PacienteTabOdontogramaProps> = ({ tipo }) => {
    const { id } = useParams<{ id: string }>();
    const [odontogramas, setOdontogramas] = useState<any[]>([]);
    const [selectedOdontoId, setSelectedOdontoId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [odontogramData, setOdontogramData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [showManual, setShowManual] = useState(false);
    const [pacienteData, setPacienteData] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'graphical' | 'literary'>('graphical');
    const [saveLiteraryTrigger, setSaveLiteraryTrigger] = useState(false);
    const [hasLiteraryData, setHasLiteraryData] = useState(false);
    const [isLiteraryModified, setIsLiteraryModified] = useState(false);

    const fetchOdontogramas = async (forceLatest = false) => {
        if (!id) return;
        setLoading(true);
        try {
            const endpoint = `/odontogramas/paciente-seguro/${id}`;
            const response = await api.get(endpoint);
            const data = response.data;
            setOdontogramas(data);
            
            if (data.length > 0) {
                // If forceLatest or no selection yet, pick the newest one
                if (forceLatest || !selectedOdontoId) {
                    setSelectedOdontoId(data[0].id);
                    setOdontogramData(data[0].mapa_dientes || {});
                }
            }
        } catch (error) {
            console.error('Error fetching odontogramas:', error);
        } finally {
            setLoading(false);
        }
    };

    const manualOdontograma: ManualSection[] = [
        {
            title: 'Estados Dentales',
            content: 'Seleccione un estado clínico (ej. Caries, Diente Ausente) y luego haga clic en la pieza dental deseada para aplicarlo. Para superficies (O, M, D, V, L, P), haga clic en la zona específica del diente.'
        },
        {
            title: 'Prótesis y Ortodoncia',
            content: 'Estas opciones se marcan pieza por pieza. Si marca piezas contiguas, el sistema dibujará automáticamente una barra de conexión indicando el rango.'
        },
        {
            title: 'Evoluciones (Versiones)',
            content: 'Cada vez que guarda, se crea una nueva versión. Puede navegar por el historial usando el selector de versiones arriba a la derecha.'
        },
        {
            title: 'Impresión',
            content: 'Use el botón de la impresora para generar el reporte oficial para el seguro con los datos del paciente.'
        }
    ];

    const manualExamenLiterario: ManualSection[] = [
        {
            title: 'Registro por Pieza',
            content: 'En este modo, cada número de pieza dental tiene una caja de texto a su lado. Puede escribir hallazgos específicos usando códigos o texto libre.'
        },
        {
            title: 'Nomenclatura Común',
            content: 'Se recomienda usar abreviaciones estándar para agilizar el registro, por ejemplo: CO (Caries), ROF (Restauración), CD (Cavidad Detrítica), S (Sano).'
        },
        {
            title: 'Guardado y Modificación',
            content: 'Si es la primera vez que registra, verá el botón "Guardar Examen". Si ya existen datos, use "Modificar Examen" para habilitar la edición. El sistema detectará automáticamente si ha realizado cambios para permitir la actualización.'
        },
        {
            title: 'Independencia de Datos',
            content: 'La información del Examen Literario es independiente del Odontograma Gráfico. Guardar cambios en uno no afecta al otro.'
        }
    ];

    const fetchPaciente = async () => {
        try {
            const endpoint = tipo === 'particular' ? `/pacientes/${id}` : `/pacientes-seguro/${id}`;
            const res = await api.get(endpoint);
            setPacienteData(res.data);
        } catch (e) {
            console.error('Error fetching paciente data', e);
        }
    };

    const handlePrint = () => {
        const odontogramContainer = document.getElementById('odontogram-print-container');
        if (!odontogramContainer) {
            Swal.fire('Error', 'No se encontró el contenido del odontograma para imprimir', 'error');
            return;
        }

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

        const getAge = () => {
            if (!pacienteData?.fecha_nacimiento) return '';
            const birthDate = new Date(pacienteData.fecha_nacimiento);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };
        const age = getAge();

        // Capture all styles from the current document
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(style => style.outerHTML)
            .join('\n');

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Registro Odontograma - ${pacienteData?.nombre || ''}</title>
                ${styles}
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                    @page { size: letter; margin: 0.5cm; }
                    body { font-family: 'Inter', sans-serif; margin: 0; padding: 10px; color: #333; font-size: 9px; background: white !important; line-height: 1.2; }
                    
                    .header-container { display: flex; align-items: start; justify-content: space-between; margin-bottom: 15px; }
                    .logo { width: 160px; height: auto; }
                    .header-text { text-align: center; flex-grow: 1; margin-right: 160px; padding-top: 40px; }
                    h1 { color: #1e40af; font-size: 18px; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 800; }
                    h3 { font-size: 11px; margin: 0; color: #4b5563; font-weight: 600; }

                    .print-meta-header { display: flex; justify-content: flex-end; gap: 15px; margin-bottom: 10px; }
                    .print-box-group { display: flex; align-items: center; gap: 5px; }
                    .print-box-label { font-weight: 800; font-size: 7px; color: #64748b; }
                    .print-grid { display: flex; border: 1px solid #cbd5e1; height: 16px; border-radius: 2px; overflow: hidden; }
                    .print-cell { width: 14px; border-right: 1px solid #cbd5e1; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 9px; background: #f8fafc; }
                    .print-cell:last-child { border-right: none; }
                    
                    .patient-info-banner { background: #f8fafc; border: 1.5px solid #e2e8f0; padding: 12px; border-radius: 10px; margin-bottom: 15px; position: relative; overflow: hidden; }
                    .patient-info-banner::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #3b82f6; }
                    
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr 1.5fr 70px 60px; gap: 12px; }
                    .info-field { display: flex; flex-direction: column; }
                    .info-label { font-size: 7px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
                    .info-value { font-weight: 800; font-size: 11px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; min-height: 14px; }
                    
                    .age-boxes { display: flex; gap: 1px; margin-top: 2px; }
                    .age-box { width: 18px; height: 20px; border: 1px solid #94a3b8; display: flex; align-items: center; justify-content: center; font-weight: 800; background: white; border-radius: 3px; font-size: 11px; }

                    .check-row { display: flex; justify-content: center; gap: 40px; margin-top: 12px; padding-top: 10px; border-top: 1px dashed #e2e8f0; }
                    .check-item { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 9px; color: #334155; }
                    .check-square { width: 16px; height: 16px; border: 1.5px solid #3b82f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: white; color: #3b82f6; font-size: 11px; }
                    
                    .odontogram-section { margin-top: 10px; padding: 10px; border: 1px solid #f1f5f9; border-radius: 12px; display: flex; flex-direction: column; align-items: center; zoom: 0.75; }
                    
                    .legend-section { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 15px; padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; }
                    .legend-column { display: flex; flex-direction: column; gap: 6px; }
                    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 8.5px; font-weight: 600; color: #475569; }
                    .legend-symbol { width: 16px; height: 16px; border: 1px solid #94a3b8; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 10px; flex-shrink: 0; background: #f8fafc; }
                    
                    .print-footer { margin-top: 100px; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 20px; }
                    .signature-box { text-align: center; width: 220px; }
                    .signature-line { border-top: 1.5px solid #0f172a; margin-bottom: 5px; }
                    .signature-label { font-weight: 800; font-size: 9px; color: #0f172a; text-transform: uppercase; }
                    .date-place { font-weight: 700; font-size: 9px; color: #475569; }
                    
                    svg { display: block !important; max-width: 100% !important; height: auto !important; }
                    .dark { background: white !important; color: #333 !important; }
                    button, .no-print, select, .lucide, .mt-6.p-4 { display: none !important; }
                </style>
            </head>
            <body>
                <div class="header-container">
                    <img src="/logo-codel.jpg" class="logo" />
                    <div class="header-text">
                        <h1>REGISTRO DE ODONTOGRAMA CLÍNICO</h1>
                        <h3>Dr. Ivan Alvaro Lima Huanca</h3>
                    </div>
                </div>

                <div class="print-meta-header">
                    <div class="print-box-group">
                        <span class="print-box-label">N.º MATRICULA SD-MSC</span>
                        <div class="print-grid">
                            ${(pacienteData?.matricula_seguro || '').split('').map(char => `<div class="print-cell">${char}</div>`).join('')}
                        </div>
                    </div>
                    <div class="print-box-group">
                        <span class="print-box-label">C.I.</span>
                        <div class="print-grid">
                            ${(pacienteData?.ci || '').split('').map(char => `<div class="print-cell">${char}</div>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="patient-info-banner">
                    <div class="info-grid">
                        <div class="info-field">
                            <span class="info-label">Apellido Paterno</span>
                            <div class="info-value">${pacienteData?.paterno?.toUpperCase() || ''}</div>
                        </div>
                        <div class="info-field">
                            <span class="info-label">Apellido Materno</span>
                            <div class="info-value">${pacienteData?.materno?.toUpperCase() || ''}</div>
                        </div>
                        <div class="info-field">
                            <span class="info-label">Nombres del Paciente</span>
                            <div class="info-value">${pacienteData?.nombre?.toUpperCase() || ''}</div>
                        </div>
                        <div class="info-field" style="align-items: center;">
                            <span class="info-label">Edad</span>
                            <div class="age-boxes">
                                <div class="age-box">${String(age).padStart(2, '0')[0] || ''}</div>
                                <div class="age-box">${String(age).padStart(2, '0')[1] || ''}</div>
                            </div>
                        </div>
                        <div class="info-field">
                            <span class="info-label" style="text-align: center;">Sexo</span>
                            <div class="info-value" style="text-align: center;">
                                ${(() => {
                                    const g = pacienteData?.genero?.toUpperCase() || '';
                                    if (g.startsWith('MASC') || g === 'M' || g === 'HOMBRE') return 'M';
                                    if (g.startsWith('FEME') || g === 'F' || g === 'MUJER') return 'F';
                                    return g.charAt(0);
                                })()}
                            </div>
                        </div>
                    </div>

                    <div class="check-row">
                        <div class="check-item">
                            <div class="check-square">${pacienteData?.es_trabajador ? '✓' : ''}</div>
                            <span>TRABAJADOR ASEGURADO</span>
                        </div>
                        <div class="check-item">
                            <div class="check-square">${pacienteData?.es_beneficiario ? '✓' : ''}</div>
                            <span>BENEFICIARIO</span>
                        </div>
                    </div>
                </div>

                <div class="odontogram-section">
                    ${odontogramContainer.innerHTML}
                </div>

                <div class="legend-section">
                    <div class="legend-column">
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #3b82f6; color: #3b82f6;">✕</div> <span>DIENTE AUSENTE</span></div>
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #2563eb; color: #2563eb;">◯</div> <span>CORONA BUEN ESTADO</span></div>
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #2563eb; background: #2563eb; color: white;">●</div> <span>OBTURACIÓN BUEN ESTADO</span></div>
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #1e40af; background: #dbeafe; color: #1e40af;">▭</div> <span>PRÓTESIS FIJA (B)</span></div>
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #2563eb; color: #2563eb; font-size: 7px;">SFF</div> <span>SELLANTE (B)</span></div>
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #4f46e5; background: #eef2ff; color: #4f46e5;">⬓</div> <span>ORTODONCIA</span></div>
                    </div>
                    
                    <div class="legend-column">
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #ef4444; color: #ef4444;">✕</div> <span>INDICADO A EXTRACCIÓN</span></div>
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #dc2626; color: #dc2626;">◯</div> <span>CORONA MAL ESTADO</span></div>
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #dc2626; background: #dc2626; color: white;">●</div> <span>OBTURACIÓN MAL ESTADO</span></div>
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #991b1b; background: #fee2e2; color: #991b1b;">▭</div> <span>PRÓTESIS FIJA (M)</span></div>
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #dc2626; color: #dc2626; font-size: 7px;">SFF</div> <span>SELLANTE (M)</span></div>
                        <div class="legend-item"><div class="legend-symbol" style="border-color: #dc2626; color: #dc2626;">⚡</div> <span>FRACTURA CORONARIA</span></div>
                    </div>
                </div>
                
                <div class="print-footer">
                    <div class="signature-box">
                        <div class="signature-line"></div>
                        <div class="signature-label">Sello y firma del médico tratante</div>
                    </div>
                    <div class="date-place">
                        Lugar y fecha: ............................................................ / .......... / .......... / .................
                    </div>
                </div>
            </body>
            </html>
        `;

        doc.open();
        doc.write(printContent);
        doc.close();

        // Wait for styles and images to load in the iframe
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 500);
        }, 1200);
    };
    useEffect(() => {
        fetchOdontogramas();
        fetchPaciente();
    }, [id, tipo]);

    const handleSave = async () => {
        if (viewMode === 'literary') {
            setSaveLiteraryTrigger(true);
            return;
        }

        // Find current version to compare
        const currentVersion = odontogramas.find(o => o.id === selectedOdontoId);
        const currentMapStr = JSON.stringify(currentVersion?.mapa_dientes || {});
        const newMapStr = JSON.stringify(odontogramData || {});

        if (currentMapStr === newMapStr) {
            Swal.fire({
                icon: 'info',
                title: 'Sin cambios',
                text: 'No se detectaron modificaciones en el odontograma.',
                timer: 2000,
                showConfirmButton: false
            });
            setIsEditing(false);
            return;
        }

        const result = await Swal.fire({
            title: '¿Guardar nueva evolución?',
            text: "Se registrará el estado actual como una nueva versión del odontograma.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // Get current user ID from local storage
                const userStr = localStorage.getItem('user');
                let usuarioId = null;
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        usuarioId = user.id;
                    } catch (e) {
                        console.error('Error parsing user data', e);
                    }
                }

                const payload = {
                    pacienteSeguroId: Number(id),
                    mapa_dientes: odontogramData,
                    notas: 'Evolución registrada',
                    usuarioId: usuarioId ? Number(usuarioId) : undefined
                };
                await api.post('/odontogramas', payload);
                setIsEditing(false);
                await fetchOdontogramas(true);
                Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'El odontograma ha sido actualizado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Error saving odontogram:', error);
                Swal.fire('Error', 'No se pudo guardar el odontograma', 'error');
            }
        }
    };

    const handleSelectVersion = (odontoId: number) => {
        const selected = odontogramas.find(o => o.id === odontoId);
        if (selected) {
            setSelectedOdontoId(odontoId);
            setOdontogramData(selected.mapa_dientes || {});
            setIsEditing(false);
        }
    };

    if (loading && odontogramas.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="content-card bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 transition-colors">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                        <Shield size={28} className="text-blue-500" />
                        Odontograma Clínico
                    </h2>

                    <div className="flex flex-wrap items-center gap-2">
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={() => setShowManual(true)}
                                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-1.5 rounded-full flex items-center justify-center w-[35px] h-[35px] text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:-translate-y-0.5 active:scale-90"
                                    title="Ayuda / Manual"
                                >
                                    ?
                                </button>
                                <button
                                    onClick={() => setViewMode(viewMode === 'graphical' ? 'literary' : 'graphical')}
                                    className={`flex items-center gap-2 font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-95 ${viewMode === 'literary' ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-white dark:bg-gray-700 text-purple-600 border border-purple-600'}`}
                                >
                                    {viewMode === 'graphical' ? <ClipboardList size={18} /> : <ArrowLeft size={18} />}
                                    {viewMode === 'graphical' ? 'Examen Literario' : 'Volver'}
                                </button>

                                {viewMode === 'graphical' && (
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <Printer size={18} />
                                        <span className="hidden sm:inline">Imprimir</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => setIsEditing(true)}
                                    className={`flex items-center gap-2 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-95 ${viewMode === 'graphical' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                                >
                                    <Edit size={18} /> 
                                    {viewMode === 'graphical' 
                                        ? (odontogramas.length > 0 ? 'Actualizar Odontograma' : 'Registrar Odontograma')
                                        : (hasLiteraryData ? 'Modificar Examen' : 'Guardar Examen')
                                    }
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                                >
                                    <Save size={18} /> 
                                    {viewMode === 'graphical' 
                                        ? 'Guardar Evolución' 
                                        : (!hasLiteraryData ? 'Guardar Examen' : (isLiteraryModified ? 'Actualizar Examen' : 'Actualizar Examen'))
                                    }
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        if (selectedOdontoId) handleSelectVersion(selectedOdontoId);
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                                >
                                    <X size={18} /> Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mt-3 gap-4 border-t border-gray-100 dark:border-gray-700/50 pt-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                        Historial de evolución dental y tratamientos realizados
                    </p>

                    {odontogramas.length > 0 && !isEditing && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                                <Clock size={16} className="text-gray-400 ml-2" />
                                <select
                                    className="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer"
                                    value={selectedOdontoId || ''}
                                    onChange={(e) => handleSelectVersion(Number(e.target.value))}
                                >
                                    {odontogramas.map((o, idx) => (
                                        <option key={o.id} value={o.id}>
                                            {idx === 0 ? 'Última Versión' : `Versión ${formatDateTime(o.fecha)}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={() => handleSelectVersion(odontogramas[0].id)}
                                className="p-2.5 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm transition-all transform hover:-translate-y-0.5 active:scale-95 hover:shadow-md"
                                title="Volver a la Última Versión"
                            >
                                <History size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={`transition-all duration-300 ${!isEditing ? 'pointer-events-none opacity-95' : 'ring-2 ring-blue-500/20 rounded-2xl p-1'}`}>
                {viewMode === 'graphical' ? (
                    <Odontogram
                        initialData={odontogramData}
                        onChange={(data) => setOdontogramData(data)}
                        readOnly={!isEditing}
                    />
                ) : (
                    <ExamenDentalLiterario 
                        pacienteId={Number(id)} 
                        readOnly={!isEditing}
                        onSaveTrigger={saveLiteraryTrigger}
                        onSaveComplete={() => {
                            setSaveLiteraryTrigger(false);
                            setIsEditing(false);
                            setHasLiteraryData(true);
                            setIsLiteraryModified(false);
                            Swal.fire({ icon: 'success', title: 'Examen Guardado', timer: 1500, showConfirmButton: false });
                        }}
                        onDataLoaded={(hasData) => {
                            setHasLiteraryData(hasData);
                            if (!hasData && viewMode === 'literary') {
                                setIsEditing(true);
                            }
                        }}
                        onModified={(modified) => setIsLiteraryModified(modified)}
                    />
                )}
            </div>

            
            {isEditing && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <Edit size={20} />
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <span className="font-bold">Modo Edición Activo:</span> Realice los cambios necesarios en el odontograma y presione "Guardar Evolución" para registrar el nuevo estado clínico del paciente.
                    </p>
                </div>
            )}

            <ManualModal
                isOpen={showManual}
                onClose={() => setShowManual(false)}
                title={viewMode === 'graphical' ? 'Manual del Odontograma Clínico' : 'Manual del Examen Literario'}
                sections={viewMode === 'graphical' ? manualOdontograma : manualExamenLiterario}
            />
        </div>
    );
};

export default PacienteTabOdontograma;
