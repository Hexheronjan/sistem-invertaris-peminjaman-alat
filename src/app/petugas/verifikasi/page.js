'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DataTable from '@/components/DataTable';
import CetakBuktiPeminjaman from '@/components/CetakBuktiPeminjaman';

export default function PetugasVerifikasiPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCetakPeminjaman, setShowCetakPeminjaman] = useState(false);
    const [selectedLoanForPrint, setSelectedLoanForPrint] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/peminjaman');
            const json = await res.json();
            const all = Array.isArray(json) ? json : json.data || [];
            setData(all);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleStatus = async (id, status) => {
        const action = status === 'disetujui' ? 'setujui' : 'tolak';
        if (!confirm(`Apakah Anda yakin ingin men-${action} peminjaman ini?`)) return;

        try {
            const res = await fetch(`/api/peminjaman/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const json = await res.json();
            if (res.ok) {
                fetchData();
            } else {
                alert(json.message || 'Gagal update status');
            }
        } catch (e) { alert('Error: ' + e.message); }
    };

    const columns = [
        {
            key: 'user.nama',
            label: 'Peminjam',
            render: (row) => <span className="font-medium text-slate-900">{row.user?.nama}</span>
        },
        {
            key: 'alat.nama_alat',
            label: 'Alat',
            render: (row) => row.alat?.nama_alat
        },
        {
            key: 'tanggal',
            label: 'Tanggal Pinjam - Kembali',
            render: (row) => (
                <span className="text-xs">
                    {new Date(row.tanggal_pinjam).toLocaleDateString()} - {new Date(row.tanggal_kembali).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => {
                const statusColors = {
                    'disetujui': 'bg-emerald-100 text-emerald-600',
                    'ditolak': 'bg-red-100 text-red-600',
                    'kembali': 'bg-blue-100 text-blue-600',
                    'pengajuan': 'bg-amber-100 text-amber-600'
                };
                return (
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[row.status] || 'bg-slate-100 text-slate-600'}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            key: 'aksi',
            label: 'Aksi',
            render: (row) => (
                <div className="flex gap-2 flex-wrap">
                    {row.status === 'pengajuan' && (
                        <>
                            <button
                                onClick={() => handleStatus(row.id_pinjam, 'disetujui')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow text-xs font-bold transition flex items-center gap-1"
                            >
                                <span>✅</span> Terima
                            </button>
                            <button
                                onClick={() => handleStatus(row.id_pinjam, 'ditolak')}
                                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded shadow text-xs font-bold transition flex items-center gap-1"
                            >
                                <span>❌</span> Tolak
                            </button>
                        </>
                    )}
                    {/* Tombol Cetak Bukti untuk semua status */}
                    <button
                        onClick={() => {
                            setSelectedLoanForPrint(row);
                            setShowCetakPeminjaman(true);
                        }}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded shadow text-xs font-bold transition flex items-center gap-1"
                        title="Cetak Bukti Peminjaman"
                    >
                        🖨️ Bukti
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen">
            <Sidebar role="petugas" />
            <main className="ml-64 p-8 animate-fade-in-up">

                {/* [1] HEADER VERIFIKASI */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Verifikasi Peminjaman</h1>
                        <p className="text-slate-500">Kelola persetujuan peminjaman alat.</p>
                    </div>
                </div>

                {loading ? <p className="animate-pulse text-slate-500">Loading...</p> : (
                    <DataTable
                        columns={columns}
                        data={data}
                    />
                )}

                {/* Modal Cetak Bukti Peminjaman */}
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
