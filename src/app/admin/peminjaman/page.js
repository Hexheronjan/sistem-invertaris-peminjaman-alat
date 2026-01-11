'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DataTable from '@/components/DataTable';

export default function PeminjamanPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/peminjaman');
            const json = await res.json();
            setData(Array.isArray(json) ? json : json.data || []);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleStatus = async (id, status) => {
        if (!confirm(`Ubah status menjadi ${status}?`)) return;
        try {
            const res = await fetch(`/api/peminjaman/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchData();
            else alert('Gagal update status');
        } catch (e) { alert('Error'); }
    };

    const columns = [
        { key: 'user.nama', label: 'Peminjam' },
        { key: 'alat.nama_alat', label: 'Alat' },
        { key: 'tanggal_pinjam', label: 'Tgl Pinjam', render: (row) => new Date(row.tanggal_pinjam).toLocaleDateString() },
        { key: 'tanggal_kembali', label: 'Tgl Kembali', render: (row) => new Date(row.tanggal_kembali).toLocaleDateString() },
        {
            key: 'status', label: 'Status', render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${row.status === 'disetujui' ? 'bg-emerald-500/20 text-emerald-400' :
                        row.status === 'ditolak' ? 'bg-red-500/20 text-red-400' :
                            row.status === 'kembali' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-amber-500/20 text-amber-400'
                    }`}>
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="admin" />
            <main className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-white mb-6">Data Peminjaman</h1>

                {loading ? <p className="animate-pulse">Loading...</p> : (
                    <div className="overflow-x-auto glass-card rounded-xl">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="text-xs uppercase bg-white/5">
                                <tr>
                                    {columns.map(c => <th key={c.key} className="px-6 py-4">{c.label}</th>)}
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {data.map(row => (
                                    <tr key={row.id_pinjam} className="hover:bg-white/5">
                                        {columns.map(c => <td key={c.key} className="px-6 py-4">{c.render ? c.render(row) : (c.key.includes('.') ? row[c.key.split('.')[0]]?.[c.key.split('.')[1]] : row[c.key])}</td>)}
                                        <td className="px-6 py-4 text-right">
                                            {row.status === 'pengajuan' && (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleStatus(row.id_pinjam, 'disetujui')} className="text-emerald-400 hover:text-emerald-300 font-bold">Terima</button>
                                                    <button onClick={() => handleStatus(row.id_pinjam, 'ditolak')} className="text-red-400 hover:text-red-300 font-bold">Tolak</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
