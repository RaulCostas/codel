import React, { useState } from 'react';
import { Shield, Save, History, RotateCcw, AlertCircle } from 'lucide-react';
import type { Odontograma } from '../types';

import molarImg from '../assets/teeth/molar.png';
import premolarImg from '../assets/teeth/premolar.png';
import canineImg from '../assets/teeth/canine.png';
import incisorImg from '../assets/teeth/incisor.png';

interface OdontogramProps {
    initialData?: any;
    onChange?: (data: any) => void;
    readOnly?: boolean;
}

const toothNumbers = {
    upper: [
        [18, 17, 16, 15, 14, 13, 12, 11],
        [21, 22, 23, 24, 25, 26, 27, 28]
    ],
    lower: [
        [48, 47, 46, 45, 44, 43, 42, 41],
        [31, 32, 33, 34, 35, 36, 37, 38]
    ]
};

const legend = [
    // Column 1: Buen Estado / Otros
    { code: 10, label: 'Diente Ausente', color: 'border-blue-500 bg-blue-50', symbol: '✕', type: 'col1' },
    { code: 12, label: 'Corona en buen estado', color: 'border-blue-600 bg-transparent', symbol: '◯', type: 'col1' },
    { code: 14, label: 'Obturación en buen estado', color: 'border-blue-600 bg-blue-600', symbol: '●', type: 'col1' },
    { code: 16, label: 'Sellante de fosas y fisuras (B)', color: 'border-blue-700 bg-blue-700', symbol: 'SFF', type: 'col1' },
    { code: 20, label: 'Prótesis parcial fija (B)', color: 'border-blue-800 bg-blue-100', symbol: '▭', type: 'col1' },
    { code: 22, label: 'Presencia de aparato de ortodoncia', color: 'border-indigo-600 bg-indigo-50', symbol: '⬓', type: 'col1' },
    { code: 23, label: 'Lesión Cervical No Cariosa (B)', color: 'border-blue-600 bg-blue-100 text-blue-600', symbol: '▬', type: 'col1' },

    // Column 2: Mal Estado
    { code: 11, label: 'Diente indicado a extracción', color: 'border-red-500 bg-red-50', symbol: '✕', type: 'col2' },
    { code: 13, label: 'Corona en mal estado', color: 'border-red-600 bg-transparent', symbol: '◯', type: 'col2' },
    { code: 15, label: 'Obturación en mal estado', color: 'border-red-600 bg-red-600', symbol: '●', type: 'col2' },
    { code: 17, label: 'Sellante de fosas y fisuras (M)', color: 'border-red-700 bg-red-700', symbol: 'SFF', type: 'col2' },
    { code: 21, label: 'Prótesis parcial fija (M)', color: 'border-red-800 bg-red-100', symbol: '▭', type: 'col2' },
    { code: 18, label: 'Fractura de corona dental', color: 'border-red-600 bg-red-100', symbol: '⚡', type: 'col2' },
    { code: 24, label: 'Lesión Cervical No Cariosa (M)', color: 'border-red-600 bg-red-100 text-red-600', symbol: '▬', type: 'col2' },
    { code: 1, label: 'Caries dental (se marca la superficie afectada)', color: 'border-red-600 bg-red-600 text-white', symbol: '●', type: 'col2' },
];

const Odontogram: React.FC<OdontogramProps> = ({ initialData, onChange, readOnly = false }) => {
    const [toothMap, setToothMap] = useState<any>(initialData || {});
    const [selectedCode, setSelectedCode] = useState<number>(14); // Default to Obturación (B)
    const [connectionStart, setConnectionStart] = useState<number | null>(null);

    // Synchronize internal state with initialData when it changes (e.g. switching versions)
    React.useEffect(() => {
        if (initialData) {
            setToothMap(initialData);
        } else {
            setToothMap({});
        }
    }, [initialData]);

    const getToothImage = (num: number) => {
        const lastDigit = num % 10;
        if ([8, 7, 6].includes(lastDigit)) return molarImg;
        if ([5, 4].includes(lastDigit)) return premolarImg;
        if ([3].includes(lastDigit)) return canineImg;
        return incisorImg;
    };

    const handleSurfaceClick = (tooth: number, surface: string) => {
        if (readOnly) return;
        const newMap = JSON.parse(JSON.stringify(toothMap));
        if (!newMap[tooth]) newMap[tooth] = { state: 0, surfaces: {} };
        
        // Toggle selected code on surface (if same code is clicked, or selectedCode is 0/eraser, deselect)
        if (newMap[tooth].surfaces[surface] === selectedCode || selectedCode === 0) {
            delete newMap[tooth].surfaces[surface];
        } else {
            newMap[tooth].surfaces[surface] = selectedCode;
        }
        
        setToothMap(newMap);
        if (onChange) onChange(newMap);
    };

    const handleToothClick = (tooth: number) => {
        if (readOnly) return;
        const newMap = JSON.parse(JSON.stringify(toothMap));
        if (!newMap.connections) newMap.connections = [];
        
        if (selectedCode === 0) {
            if (newMap[tooth]) {
                delete newMap[tooth].connectionType;
                newMap[tooth].state = 0;
            }
        } else if (selectedCode === 20 || selectedCode === 21 || selectedCode === 22) {
            if (!newMap[tooth]) newMap[tooth] = { state: 0, surfaces: {} };
            
            // Toggle this connection type on the tooth
            if (newMap[tooth].connectionType === selectedCode) {
                delete newMap[tooth].connectionType;
            } else {
                newMap[tooth].connectionType = selectedCode;
            }
        } else {
            // Standard state assignment
            if (!newMap[tooth]) newMap[tooth] = { state: 0, surfaces: {} };
            newMap[tooth].state = newMap[tooth].state === selectedCode ? 0 : selectedCode;
        }
        
        setToothMap(newMap);
        if (onChange) onChange(newMap);
    };

    const getSurfaceColor = (tooth: number, surface: string) => {
        const state = toothMap[tooth]?.surfaces?.[surface];
        if (state === undefined || state === 0) return '#f1f5f9'; // Solid light gray
        
        // Find in legend to determine color by type
        const item = legend.find(l => l.code === state);
        if (item) {
            if (item.type === 'col1') return '#3b82f6'; // Blue-500
            if (item.type === 'col2') return '#ef4444'; // Red-500
        }

        // Fallback for legacy codes (if any)
        if (state === 1) return '#ef4444'; // Caries - Red
        if (state === 3) return '#3b82f6'; // Obturado - Blue
        
        return '#cbd5e1';
    };

    const getToothOverlay = (tooth: number) => {
        const state = toothMap[tooth]?.state;
        if (state === 4 || state === 5) return 'X'; // Perdido
        if (state === 6) return '◯'; // Corona
        return null;
    };

    const renderTooth = (num: number) => {
        const toothData = toothMap[num] || { state: 0, surfaces: {} };
        const state = toothData.state;
        const toothImg = getToothImage(num);
        
        // Visual Flags
        const isAbsent = state === 10;
        const isExtraction = state === 11;
        const isCoronaB = state === 12;
        const isCoronaM = state === 13;
        const isObturaB = state === 14;
        const isObturaM = state === 15;
        const isSellanteB = state === 16;
        const isSellanteM = state === 17;
        const isFractura = state === 18;
        const isCariesState = state === 1;
        const isLcncB = state === 23;
        const isLcncM = state === 24;

        // Connection indicators
        const connType = toothData.connectionType;
        const connColor = connType === 20 ? '#2563eb' : connType === 21 ? '#dc2626' : connType === 22 ? '#9333ea' : null;

        const isUpper = num < 30;

        const schematicBox = (
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 cursor-pointer mb-1">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                    <polygon points="5,5 95,5 75,25 25,25" fill={getSurfaceColor(num, 'V')} stroke="#cbd5e1" strokeWidth="1" className="hover:filter hover:brightness-110 transition-all" onClick={(e) => { e.stopPropagation(); handleSurfaceClick(num, 'V'); }} />
                    <polygon points="95,5 95,95 75,75 75,25" fill={getSurfaceColor(num, 'D')} stroke="#cbd5e1" strokeWidth="1" className="hover:filter hover:brightness-110 transition-all" onClick={(e) => { e.stopPropagation(); handleSurfaceClick(num, 'D'); }} />
                    <polygon points="5,95 95,95 75,75 25,75" fill={getSurfaceColor(num, 'L')} stroke="#cbd5e1" strokeWidth="1" className="hover:filter hover:brightness-110 transition-all" onClick={(e) => { e.stopPropagation(); handleSurfaceClick(num, 'L'); }} />
                    <polygon points="5,5 5,95 25,75 25,25" fill={getSurfaceColor(num, 'M')} stroke="#cbd5e1" strokeWidth="1" className="hover:filter hover:brightness-110 transition-all" onClick={(e) => { e.stopPropagation(); handleSurfaceClick(num, 'M'); }} />
                    <rect x="25" y="25" width="50" height="50" fill={getSurfaceColor(num, 'O')} stroke="#cbd5e1" strokeWidth="1" className="hover:filter hover:brightness-110 transition-all" onClick={(e) => { e.stopPropagation(); handleSurfaceClick(num, 'O'); }} />
                </svg>
            </div>
        );

        const anatomicalFigure = (
            <div 
                className="relative w-8 h-8 sm:w-10 sm:h-10 cursor-pointer transition-all"
                onClick={() => handleToothClick(num)}
            >
                <img 
                    src={toothImg} 
                    alt="" 
                    className={`w-full h-full object-contain pointer-events-none transition-all ${(isAbsent || isExtraction) ? 'opacity-30 grayscale brightness-125' : ''}`} 
                />
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm">
                    {/* Diente Ausente (Blue X) */}
                    {isAbsent && (
                        <>
                            <line x1="5" y1="5" x2="95" y2="95" stroke="#2563eb" strokeWidth="12" strokeLinecap="round" />
                            <line x1="95" y1="5" x2="5" y2="95" stroke="#2563eb" strokeWidth="12" strokeLinecap="round" />
                        </>
                    )}
                    {/* Diente Extracción (Red X) */}
                    {isExtraction && (
                        <>
                            <line x1="5" y1="5" x2="95" y2="95" stroke="#dc2626" strokeWidth="12" strokeLinecap="round" />
                            <line x1="95" y1="5" x2="5" y2="95" stroke="#dc2626" strokeWidth="12" strokeLinecap="round" />
                        </>
                    )}
                    {/* Coronas */}
                    {(isCoronaB || isCoronaM) && (
                        <circle cx="50" cy="50" r="45" fill="none" stroke={isCoronaB ? '#2563eb' : '#dc2626'} strokeWidth={isCoronaM ? "10" : "6"} />
                    )}
                    {/* Obturaciones */}
                    {isObturaB && (
                        <circle cx="50" cy="50" r="25" fill="#2563eb" />
                    )}
                    {isObturaM && (
                        <>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#dc2626" strokeWidth="6" />
                            <circle cx="50" cy="50" r="25" fill="#dc2626" />
                        </>
                    )}
                    {/* Sellantes */}
                    {isSellanteB && (
                        <>
                            <circle cx="50" cy="50" r="22" fill="#2563eb" />
                            <text x="50" y="95" textAnchor="middle" fill="#2563eb" fontSize="22" fontWeight="black">SFF</text>
                        </>
                    )}
                    {isSellanteM && (
                        <>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#dc2626" strokeWidth="6" />
                            <circle cx="50" cy="50" r="22" fill="#dc2626" />
                            <text x="50" y="95" textAnchor="middle" fill="#dc2626" fontSize="22" fontWeight="black">SFF</text>
                        </>
                    )}
                    {/* Fractura */}
                    {isFractura && (
                        <path d="M20,20 L40,50 L60,20 L80,50" fill="none" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                    {/* Caries (Punto Rojo) */}
                    {isCariesState && (
                        <circle cx="50" cy="50" r="18" fill="#dc2626" stroke="#ffffff" strokeWidth="4" className="drop-shadow" />
                    )}
                    {/* Lesión Cervical No Cariosa */}
                    {(isLcncB || isLcncM) && (
                        <line 
                            x1="15" 
                            y1="82" 
                            x2="85" 
                            y2="82" 
                            stroke={isLcncB ? '#2563eb' : '#dc2626'} 
                            strokeWidth="10" 
                            strokeLinecap="round"
                        />
                    )}
                    {/* Prótesis parcial fija / Ortodoncia */}
                    {connColor && (
                        connType === 22 ? (
                            <line 
                                x1="0" 
                                y1="50" 
                                x2="100" 
                                y2="50" 
                                stroke={connColor} 
                                strokeWidth="8" 
                            />
                        ) : (
                            <rect 
                                x="4" 
                                y="4" 
                                width="92" 
                                height="92" 
                                fill={connType === 20 ? 'rgba(37, 99, 235, 0.15)' : connType === 21 ? 'rgba(220, 38, 38, 0.15)' : 'rgba(147, 51, 234, 0.15)'} 
                                stroke={connColor} 
                                strokeWidth="8" 
                                rx="8"
                            />
                        )
                    )}
                </svg>
            </div>
        );

        const periodontalBox = (
            <div 
                className="w-8 h-2.5 sm:w-10 sm:h-3 border border-gray-300 dark:border-gray-600 cursor-pointer rounded-sm hover:brightness-110 transition-all shadow-inner"
                style={{ backgroundColor: getSurfaceColor(num, 'P') }}
                title="Superficie Radicular/Periodontal"
                onClick={(e) => { e.stopPropagation(); handleSurfaceClick(num, 'P'); }}
            />
        );

        return (
            <div key={num} className={`flex flex-col items-center gap-1.5 group/tooth p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all ${connectionStart === num ? 'ring-2 ring-blue-500 bg-blue-50 animate-pulse' : ''}`}>
                {isUpper ? (
                    <>
                        <div className="flex flex-col items-center relative">
                            {anatomicalFigure}
                            {schematicBox}
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                            {periodontalBox}
                            <span className="text-[10px] font-black text-gray-500 group-hover/tooth:text-blue-500 transition-colors">{num}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-black text-gray-500 group-hover/tooth:text-blue-500 transition-colors">{num}</span>
                            {periodontalBox}
                        </div>
                        <div className="flex flex-col items-center relative">
                            {schematicBox}
                            {anatomicalFigure}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div id="odontogram-print-container" className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <Shield className="text-blue-600" size={24} />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Odontograma Clínico</h3>
                </div>
                {!readOnly && (
                    <button
                        type="button"
                        onClick={() => setSelectedCode(selectedCode === 0 ? 14 : 0)}
                        className={`flex items-center gap-2 py-2 px-4 rounded-xl border transition-all text-xs font-bold shadow-sm transform hover:-translate-y-0.5 active:scale-95 ${selectedCode === 0 ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ring-2 ring-red-500/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                    >
                        <span className="text-sm">✖</span>
                        Desmarcar / Limpiar Cara
                    </button>
                )}
            </div>

            {/* Legend / Tool Selection (Categorized) */}
            {!readOnly && (
                <div className="mb-8">
                    <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-4 block">Simbología Clínica</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Column 1 */}
                        <div className="flex flex-col gap-2">
                            {legend.filter(l => l.type === 'col1').map((item) => (
                                <button
                                    key={item.code}
                                    type="button"
                                    onClick={() => setSelectedCode(item.code)}
                                    className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all text-left w-fit min-w-[160px] ${selectedCode === item.code ? 'border-blue-600 ring-2 ring-blue-500/10 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'}`}
                                >
                                    <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded border text-[10px] font-black ${item.color}`}>
                                        {item.symbol}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-gray-700 dark:text-gray-200 uppercase leading-tight">{item.label}</span>
                                        {[20, 21, 22, 23, 24].includes(item.code) && selectedCode === item.code && (
                                            <span className="text-[8px] text-blue-600 font-bold animate-pulse mt-0.5">MARQUE PIEZA POR PIEZA</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-2">
                            {legend.filter(l => l.type === 'col2').map((item) => (
                                <button
                                    key={item.code}
                                    type="button"
                                    onClick={() => setSelectedCode(item.code)}
                                    className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all text-left w-fit min-w-[160px] ${selectedCode === item.code ? 'border-red-600 ring-2 ring-red-500/10 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'}`}
                                >
                                    <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded border text-[10px] font-black ${item.color}`}>
                                        {item.symbol}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-gray-700 dark:text-gray-200 uppercase leading-tight">{item.label}</span>
                                        {[20, 21, 22, 23, 24].includes(item.code) && selectedCode === item.code && (
                                            <span className="text-[8px] text-red-600 font-bold animate-pulse mt-0.5">MARQUE PIEZA POR PIEZA</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tooth Grid */}
            <div className="flex flex-col gap-8 select-none">
                {/* Upper Arch */}
                <div className="relative flex flex-col gap-4 bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center px-4">
                        <span className="text-[10px] font-black text-gray-400">SUPERIOR DERECHA</span>
                        <span className="text-[10px] font-black text-gray-400">SUPERIOR IZQUIERDA</span>
                    </div>
                    <div className="flex justify-center flex-wrap gap-2 sm:gap-4 relative">
                        {/* Global Connection Layer (Upper) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                            {toothMap.connections?.filter((c: any) => c.from < 30).map((conn: any, i: number) => {
                                // Simplified bridge/ortho line between teeth
                                // In a real implementation with known coordinates, we'd use fixed points.
                                // For now, we'll draw indicators on the teeth themselves or a simplified top-level line.
                                return null; // Logic for specific coordinate mapping would go here
                            })}
                        </svg>
                        
                        <div className="flex gap-1 sm:gap-2">
                            {toothNumbers.upper[0].map(renderTooth)}
                        </div>
                        <div className="w-px h-12 bg-gray-200 dark:bg-gray-700 self-center hidden sm:block"></div>
                        <div className="flex gap-1 sm:gap-2">
                            {toothNumbers.upper[1].map(renderTooth)}
                        </div>
                    </div>
                    
                    {/* Dynamic Connection Ranges List */}
                    {(() => {
                        // Helper to get contiguous ranges from the toothMap
                        const getRanges = () => {
                            const ranges: any[] = [];
                            const types = [20, 21, 22];
                            
                            types.forEach(type => {
                                // Full list of teeth in order for the arch
                                const teethOrder = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
                                let currentRange: number[] = [];
                                
                                teethOrder.forEach((num, idx) => {
                                    const hasType = toothMap[num]?.connectionType === type;
                                    const isNextAdjacent = idx > 0 && 
                                        ((teethOrder[idx-1] <= 11 && num === 21) || 
                                         (teethOrder[idx-1] <= 41 && num === 31) ||
                                         (Math.abs(teethOrder[idx-1] - num) === 1 && Math.floor(teethOrder[idx-1]/10) === Math.floor(num/10)));

                                    if (hasType) {
                                        if (currentRange.length === 0 || isNextAdjacent) {
                                            currentRange.push(num);
                                        } else {
                                            ranges.push({ type, from: currentRange[0], to: currentRange[currentRange.length-1] });
                                            currentRange = [num];
                                        }
                                    } else {
                                        if (currentRange.length > 0) {
                                            ranges.push({ type, from: currentRange[0], to: currentRange[currentRange.length-1] });
                                            currentRange = [];
                                        }
                                    }
                                });
                                if (currentRange.length > 0) {
                                    ranges.push({ type, from: currentRange[0], to: currentRange[currentRange.length-1] });
                                }
                            });
                            return ranges;
                        };

                        const computedRanges = getRanges();
                        if (computedRanges.length === 0) return null;

                        return (
                            <div className="mt-4 flex flex-wrap gap-2 px-4">
                                {computedRanges.map((c: any, index: number) => (
                                    <div key={index} className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border shadow-sm transition-all hover:scale-105 ${c.type === 20 ? 'bg-blue-600 border-blue-700 text-white' : c.type === 21 ? 'bg-red-600 border-red-700 text-white' : 'bg-purple-600 border-purple-700 text-white'}`}>
                                        <span>{c.type === 20 ? 'PRÓTESIS FIJA (B)' : c.type === 21 ? 'PRÓTESIS FIJA (M)' : 'ORTODONCIA'}: {c.from === c.to ? c.from : `${c.from} ↔ ${c.to}`}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* Lower Arch */}
                <div className="relative flex flex-col gap-4 bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center px-4">
                        <span className="text-[10px] font-black text-gray-400">INFERIOR DERECHA</span>
                        <span className="text-[10px] font-black text-gray-400">INFERIOR IZQUIERDA</span>
                    </div>
                    <div className="flex justify-center flex-wrap gap-2 sm:gap-4">
                        <div className="flex gap-1 sm:gap-2">
                            {toothNumbers.lower[0].map(renderTooth)}
                        </div>
                        <div className="w-px h-12 bg-gray-200 dark:bg-gray-700 self-center hidden sm:block"></div>
                        <div className="flex gap-1 sm:gap-2">
                            {toothNumbers.lower[1].map(renderTooth)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Instruction message removed per user request */}
        </div>
    );
};

export default Odontogram;
