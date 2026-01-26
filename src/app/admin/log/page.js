'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/components/ToastProvider';

export default function LogPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const fetchLogs = (currentPage = 1) => {
        setLoading(true);
        fetch(`/api/log?page=${currentPage}&limit=${limit}`)
            .then(res => res.json())
            .then(json => {
                setData(json.data || []);
                if (json.pagination) {
                    setTotalPages(json.pagination.totalPages);
                    setTotalData(json.pagination.total);
                    setPage(json.pagination.page);
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Gagal memuat log', 'error');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchLogs(page);
    }, [page]); // Re-fetch on page change

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleDelete = async (row) => {
        if (!confirm('Hapus log aktivitas ini?')) return;
        try {
            const res = await fetch(`/api/log?id=${row.id_log}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Log berhasil dihapus');
                fetchLogs(page); // Refresh current page
            } else {
                showToast('Gagal menghapus log', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan sistem', 'error');
        }
    };

    const handleCleanOldLogs = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus semua log yang lebih lama dari 7 hari?')) return;
        try {
            const res = await fetch('/api/log?action=clean_old', { method: 'DELETE' });
            const json = await res.json();
            if (res.ok) {
                showToast(json.message);
                fetchLogs(1); // Back to page 1
            } else {
                showToast('Gagal membersihkan log', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan sistem', 'error');
        }
    };

    const groupedData = {};
    data.forEach(log => {
        const date = new Date(log.waktu).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        if (!groupedData[date]) groupedData[date] = [];
        groupedData[date].push(log);
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="admin" />

            <main className="ml-72 p-8 transition-all duration-300">
                <div className="section-header animate-fade-in-up bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Log Aktivitas Sistem</h1>
                        <p className="text-slate-500 mt-1">Pantau rekam jejak aktivitas pengguna secara real-time.</p>
                    </div>
                    <button
                        onClick={handleCleanOldLogs}
                        className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-colors text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Bersihkan Log Lama
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Memuat riwayat aktivitas...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm animate-fade-in-up delay-100">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 opacity-70">📜</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Aktivitas</h3>
                        <p className="text-slate-500">Log sistem masih kosong atau telah dibersihkan.</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in-up delay-100">
                        {Object.entries(groupedData).map(([date, logs]) => (
                            <div key={date} className="relative">
                                <div className="sticky top-4 z-10 mb-4 ml-2">
                                    <span className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-slate-900/10">
                                        📅 {date}
                                    </span>
                                </div>
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
                                    {logs.map((log, idx) => (
                                        <div key={log.id_log} className={`flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors group ${idx !== logs.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm ${log.user?.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                                                    log.user?.role === 'petugas' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {log.user?.nama?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                {log.user?.role === 'admin' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 border-2 border-white rounded-full"></div>}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-800 leading-relaxed truncate pr-4">
                                                    <span className="font-bold text-slate-900 mr-2">{log.user?.nama}</span>
                                                    <span className="text-slate-600">{log.aktivitas}</span>
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-2">
                                                    <span>⏰ {new Date(log.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="uppercase text-[10px] tracking-wider">{log.user?.role?.nama_role || 'User'}</span>
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleDelete(log)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Hapus Log"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-8">
                            <p className="text-sm text-slate-500 font-medium">
                                Menampilkan <span className="text-slate-900 font-bold">{data.length}</span> dari <span className="text-slate-900 font-bold">{totalData}</span> aktivitas
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                                >
                                    ← Sebelumnya
                                </button>
                                <div className="flex items-center justify-center w-10 h-10 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md shadow-slate-900/10">
                                    {page}
                                </div>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                                >
                                    Selanjutnya →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
