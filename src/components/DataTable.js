'use client';

import { useState } from 'react';

export default function DataTable({ columns, data, onEdit, onDelete }) {
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    if (!data || data.length === 0) {
        return (
            <div className="text-center p-12 text-slate-400 glass-card rounded-2xl animate-fade-in-up border border-slate-200 bg-white">
                <div className="text-4xl mb-4 opacity-50">📂</div>
                <p className="font-medium">Data tidak ditemukan.</p>
            </div>
        );
    }

    // Pagination Logic
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="bg-white rounded-2xl animate-fade-in-up shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs uppercase bg-slate-50/50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="px-6 py-5 tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            {(onEdit || onDelete) && <th className="px-6 py-5 text-center tracking-wider w-[100px]">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition duration-200 group">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-slate-600 group-hover:text-slate-900 transition-colors">
                                        {/* Handle Nested Objects */}
                                        {col.render ? col.render(row) : (
                                            col.key.includes('.')
                                                ? row[col.key.split('.')[0]]?.[col.key.split('.')[1]]
                                                : row[col.key]
                                        )}
                                    </td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="p-2 rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm hover:shadow-md border border-transparent hover:border-blue-100"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(row)}
                                                    className="p-2 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm hover:shadow-md border border-transparent hover:border-rose-100"
                                                    title="Hapus"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Tampilkan</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1); // Reset to first page
                        }}
                        className="px-2 py-1 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span>dari <strong>{data.length}</strong> data</span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-500 hover:text-blue-600"
                    >
                        ◀
                    </button>

                    {/* Simple Page Indicator */}
                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let p = i + 1;
                            if (totalPages > 5 && currentPage > 3) {
                                p = currentPage - 2 + i;
                            }
                            if (p > totalPages) return null;

                            return (
                                <button
                                    key={p}
                                    onClick={() => handlePageChange(p)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition flex items-center justify-center ${currentPage === p ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-500 hover:text-blue-600"
                    >
                        ▶
                    </button>
                </div>
            </div>
        </div>
    );
}
