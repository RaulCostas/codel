import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { formatFullName } from '../utils/formatters';
import type { Paciente } from '../types';

interface SearchablePatientSelectProps {
    onSelect: (type: 'particular' | 'seguro' | null, id: number) => void;
    selectedId?: number;
    selectedType?: 'particular' | 'seguro' | null;
    required?: boolean;
    placeholder?: string;
    className?: string;
    allowType?: 'particular' | 'seguro' | 'both';
}

const SearchablePatientSelect: React.FC<SearchablePatientSelectProps> = ({
    onSelect,
    selectedId,
    selectedType,
    required = false,
    placeholder = "-- Seleccione Paciente --",
    className = "",
    allowType = 'both'
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<{ type: 'particular' | 'seguro', data: any }[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Initial label set if selectedId/Type provided
    useEffect(() => {
        if (selectedId && selectedType) {
            fetchInitialLabel(selectedType, selectedId);
        } else {
            setSelectedLabel('');
            setSearchTerm('');
        }
    }, [selectedId, selectedType]);

    const fetchInitialLabel = async (type: string, id: number) => {
        try {
            const endpoint = type === 'particular' ? `/pacientes/${id}` : `/pacientes-seguro/${id}`;
            const response = await api.get(endpoint);
            const p = response.data;
            let label = formatFullName(p);
            if (type === 'seguro' && p.seguro) {
                label += ` (${p.seguro.nombre})`;
            }
            setSelectedLabel(label);
        } catch (error) {
            console.error('Error fetching initial patient label:', error);
        }
    };

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Debounced search (and load initial when empty)
    useEffect(() => {
        const query = searchTerm.trim();
        const fetchPatients = async () => {
            setLoading(true);
            try {
                const promises = [];
                const searchParam = query ? `&search=${query}` : '';
                
                if (allowType === 'both' || allowType === 'particular') {
                    promises.push(api.get(`/pacientes?limit=10${searchParam}`));
                } else {
                    promises.push(Promise.resolve({ data: { data: [] } }));
                }

                if (allowType === 'both' || allowType === 'seguro') {
                    promises.push(api.get(`/pacientes-seguro?limit=10${searchParam}`));
                } else {
                    promises.push(Promise.resolve({ data: { data: [] } }));
                }

                const [particularRes, seguroRes] = await Promise.all(promises);

                const particular = (particularRes.data.data || []).map((p: any) => ({ type: 'particular' as const, data: p }));
                const seguro = (seguroRes.data.data || []).map((p: any) => ({ type: 'seguro' as const, data: p }));

                setResults([...particular, ...seguro]);
            } catch (error) {
                console.error('Error searching patients:', error);
            } finally {
                setLoading(false);
            }
        };

        if (query.length === 0) {
            if (isOpen) {
                fetchPatients();
            } else {
                setResults([]);
            }
            return;
        }

        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(fetchPatients, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, isOpen, allowType]);

    const handleSelect = (type: 'particular' | 'seguro', patient: any) => {
        let label = formatFullName(patient);
        if (type === 'seguro' && patient.seguro) {
            label += ` (${patient.seguro.nombre})`;
        }
        setSelectedLabel(label);
        onSelect(type, patient.id);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between pl-3 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left text-sm"
                >
                    <div className="flex items-center gap-2 truncate">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="truncate">{selectedLabel || placeholder}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
                        {!!selectedId && (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(null, 0);
                                    setSelectedLabel('');
                                }}
                                className="p-0.5 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </span>
                        )}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-[1001] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-2.5 flex flex-col gap-2">
                    <div className="relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto flex flex-col mt-1 gap-1">
                        {loading && <div className="p-3 text-sm text-gray-500 text-center">Buscando...</div>}
                        {!loading && results.length === 0 && (
                            <div className="p-3 text-sm text-gray-500 text-center">
                                {searchTerm.trim() ? "No se encontraron pacientes" : "Escriba para buscar..."}
                            </div>
                        )}
                        
                        {!loading && results.map((res, index) => (
                            <div
                                key={`${res.type}-${res.data.id}-${index}`}
                                onClick={() => handleSelect(res.type, res.data)}
                                className="p-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-start gap-2.5 transition-colors"
                            >
                                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                                    res.type === 'particular' ? 'bg-blue-500' : 'bg-green-500'
                                }`} />
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">
                                        {formatFullName(res.data)}
                                    </span>
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                        Cel: {res.data.telefono_celular || 'Sin celular'} {res.data.ci ? `| CI: ${res.data.ci}` : ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchablePatientSelect;
