'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/components/ToastProvider';
import CetakBuktiPeminjaman from '@/components/CetakBuktiPeminjaman';

export default function PeminjamanPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('semua');
    const { showToast } = useToast();
    const [showCetakPeminjaman, setShowCetakPeminjaman] = useState(false);
    const [selectedLoanForPrint, setSelectedLoanForPrint] = useState(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const fetchData = async (currentPage = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/peminjaman?page=${currentPage}&limit=${limit}`);
            const json = await res.json();

            // Handle new paginated response
            const loanData = json.data || (Array.isArray(json) ? json : []);
            setData(loanData);

            if (json.pagination) {
                setTotalPages(json.pagination.totalPages);
                setTotalData(json.pagination.total);
                setPage(json.pagination.page);
            }
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(page); }, [page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleStatus = async (id, status) => {
        if (!confirm(`Ubah status menjadi ${status}?`)) return;
        try {
            const res = await fetch(`/api/peminjaman/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                showToast(`Status berhasil diubah menjadi ${status}`);
                fetchData();
            } else {
                showToast('Gagal update status', 'error');
            }
        } catch (e) {
            showToast('Terjadi kesalahan', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'pengajuan': 'badge badge-warning',
            'disetujui': 'badge badge-success',
            'ditolak': 'badge badge-danger',
            'kembali': 'badge badge-secondary',
            'menunggu_kembali': 'badge badge-primary'
        };
        const labels = {
            'menunggu_kembali': 'Menunggu Verifikasi'
        };
        return <span className={styles[status] || 'badge'}>{labels[status] || status}</span>;
    };

    const filteredData = filter === 'semua' ? data : data.filter(d => d.status === filter);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="admin" />

            <main className="ml-72 p-8 transition-all duration-300">
                {/* Header Premium */}
                <div className="section-header animate-fade-in-up bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Peminjaman</h1>
                        <p className="text-slate-500 mt-2 text-lg">Monitor status dan kelola persetujuan peminjaman alat.</p>
                    </div>
                    <div className="hidden md:block">
                        <span className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                            📋
                        </span>
                    </div>
                </div>

                {/* Filter Tabs HD */}
                <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up delay-100 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
                    {['semua', 'pengajuan', 'disetujui', 'menunggu_kembali', 'kembali'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${filter === status
                                ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/20 scale-105'
                                : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                        >
                            {status === 'semua' ? 'Semua' : status.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>

                {/* Table Card HD */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] animate-fade-in-up delay-200">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-14 h-14 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 font-medium animate-pulse">Sedang memuat data...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-6 opacity-80">📭</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak Ada Data</h3>
                            <p className="text-slate-500 max-w-sm">Belum ada data peminjaman yang sesuai dengan filter yang Anda pilih.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Peminjam</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Alat</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Jadwal</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredData.map((row) => (
                                            <tr key={row.id_pinjam} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-md shadow-blue-500/20">
                                                            {row.user?.nama?.[0] || 'U'}
                                                        </div>
                                                        <span className="font-bold text-slate-700">{row.user?.nama}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-slate-600">{row.alat?.nama_alat}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm border border-slate-200">
                                                        {row.jumlah || 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col text-xs font-medium">
                                                        <span className="text-slate-500">Pinjam: <span className="text-slate-700">{new Date(row.tanggal_pinjam).toLocaleDateString('id-ID')}</span></span>
                                                        <span className="text-slate-500">Kembali: <span className="text-slate-700">{new Date(row.tanggal_kembali).toLocaleDateString('id-ID')}</span></span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="transform transition-transform group-hover:scale-105 origin-left">
                                                        {getStatusBadge(row.status)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                        {row.status === 'pengajuan' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatus(row.id_pinjam, 'disetujui')}
                                                                    className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"
                                                                    title="Terima"
                                                                >
                                                                    ✅ Terima
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatus(row.id_pinjam, 'ditolak')}
                                                                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"
                                                                    title="Tolak"
                                                                >
                                                                    ❌ Tolak
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedLoanForPrint(row);
                                                                setShowCetakPeminjaman(true);
                                                            }}
                                                            className="p-2 bg-slate-50 text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-md border border-slate-100 rounded-xl transition-all"
                                                            title="Cetak Bukti"
                                                        >
                                                            🖨️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-4">
                                <p className="text-sm text-slate-500 font-medium">
                                    Menampilkan <span className="text-slate-900 font-bold">{filteredData.length}</span> dari <span className="text-slate-900 font-bold">{totalData}</span> data
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
                </div>

                {/* Modal Cetak */}
                {showCetakPeminjaman && selectedLoanForPrint && (
                    <CetakBuktiPeminjaman
                        peminjaman={selectedLoanForPrint}
                        onClose={() => {
                            setShowCetakPeminjaman(false);
                            setSelectedLoanForPrint(null);
                        }}
                    />
                )}
            </main>
        </div>
    );
}
