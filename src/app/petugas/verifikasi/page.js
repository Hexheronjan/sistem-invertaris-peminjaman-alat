'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function PetugasVerifikasiPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/peminjaman');
            const json = await res.json();
            // Filter only 'pengajuan' for verification focus, or all? 
            // Sidebar says "Verifikasi Peminjaman", usually implies pending ones.
            // But showing all is fine too. Let's show specific pending ones first or sorted.
            const all = Array.isArray(json) ? json : json.data || [];
            setData(all);
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

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="petugas" />
            <main className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-white mb-6">Verifikasi Peminjaman</h1>

                {loading ? <p className="animate-pulse">Loading...</p> : (
                    <div className="overflow-x-auto glass-card rounded-xl">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="text-xs uppercase bg-white/5">
                                <tr>
                                    <th className="px-6 py-4">Peminjam</th>
                                    <th className="px-6 py-4">Alat</th>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {data.map(row => (
                                    <tr key={row.id_pinjam} className="hover:bg-white/5">
                                        <td className="px-6 py-4 font-medium text-white">{row.user.nama}</td>
                                        <td className="px-6 py-4">{row.alat.nama_alat}</td>
                                        <td className="px-6 py-4">
                                            {new Date(row.tanggal_pinjam).toLocaleDateString()} - {new Date(row.tanggal_kembali).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${row.status === 'disetujui' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    row.status === 'ditolak' ? 'bg-red-500/20 text-red-400' :
                                                        row.status === 'kembali' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {row.status === 'pengajuan' && (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleStatus(row.id_pinjam, 'disetujui')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow text-xs font-bold transition">Terima</button>
                                                    <button onClick={() => handleStatus(row.id_pinjam, 'ditolak')} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded shadow text-xs font-bold transition">Tolak</button>
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
