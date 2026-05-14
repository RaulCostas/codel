import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { ArancelSeguro, Seguro } from '../types';
import Pagination from './Pagination';
import Swal from 'sweetalert2';
import ArancelSeguroForm from './ArancelSeguroForm';
import { ClipboardList, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';

interface ArancelSeguroListProps {
    seguroId?: number;
}

const ArancelSeguroList: React.FC<ArancelSeguroListProps> = ({ seguroId }) => {
    const [aranceles, setAranceles] = useState<ArancelSeguro[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [seguros, setSeguros] = useState<Seguro[]>([]);

    useEffect(() => {
        fetchAranceles();
    }, [currentPage, searchTerm, seguroId]);

    useEffect(() => {
        fetchSeguros();
    }, []);

    const fetchSeguros = async () => {
        try {
            const response = await api.get<{ data: Seguro[] }>('/seguro?limit=100');
            setSeguros(response.data.data);
        } catch (error) {
            console.error('Error fetching seguros:', error);
        }
    };

    const fetchAranceles = async () => {
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                search: searchTerm,
            });
            if (seguroId) params.append('seguroId', seguroId.toString());

            const response = await api.get(`/arancel-seguro?${params}`);
            const sortedData = response.data.data.sort((a: any, b: any) => (a.codigo || '').localeCompare(b.codigo || ''));
            setAranceles(sortedData);
            setTotalPages(response.data.totalPages);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching aranceles seguro:', error);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Dar de baja?',
            text: 'El arancel pasará a estado Inactivo.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, dar de baja',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.patch(`/arancel-seguro/${id}`, { estado: 'inactivo' });
                Swal.fire('¡Dado de baja!', '', 'success');
                fetchAranceles();
            } catch (error) {
                Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
            }
        }
    };

    const handleReactivate = async (id: number) => {
        try {
            await api.patch(`/arancel-seguro/${id}`, { estado: 'activo' });
            Swal.fire('¡Reactivado!', '', 'success');
            fetchAranceles();
        } catch (error) {
            Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
        }
    };

    const handleCreate = () => {
        setSelectedId(null);
        setIsModalOpen(true);
    };

    const handleEdit = (id: number) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <ClipboardList className="text-blue-500" />
                        Aranceles de Seguro
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">Gestión de precios por aseguradora</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 shadow-md transition-all"
                >
                    <Plus size={20} />
                    Nuevo Arancel
                </button>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar por tratamiento o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Código</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Descripción</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Especialidad</th>
                            {!seguroId && <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Seguro</th>}
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Precio</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {aranceles.map((a) => (
                            <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 text-sm">{a.codigo}</td>
                                <td className="px-4 py-3 text-sm">{a.detalle}</td>
                                <td className="px-4 py-3 text-sm">{a.especialidad?.especialidad}</td>
                                {!seguroId && <td className="px-4 py-3 text-sm">{a.seguro?.nombre}</td>}
                                <td className="px-4 py-3 text-sm font-bold">{a.moneda} {a.precio}</td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs ${a.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {a.estado}
                                    </span>
                                </td>
                                <td className="px-4 py-3 flex gap-2 justify-center">
                                    <button onClick={() => handleEdit(a.id)} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"><Edit2 size={18} /></button>
                                    {a.estado === 'activo' ? (
                                        <button onClick={() => handleDelete(a.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                    ) : (
                                        <button onClick={() => handleReactivate(a.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={18} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}

            <ArancelSeguroForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                id={selectedId}
                seguroId={seguroId}
                onSaveSuccess={fetchAranceles}
            />
        </div>
    );
};

export default ArancelSeguroList;
