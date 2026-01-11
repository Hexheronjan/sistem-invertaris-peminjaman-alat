'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';

export default function PeminjamRiwayatPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/'); return; }
        setUser(JSON.parse(stored));
    }, []);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch('/api/peminjaman');
            const json = await res.json();
            const all = Array.isArray(json) ? json : json.data || [];
            // Client-side filter for now
            const myLoans = all.filter(l => l.id_user === user.id_user);
            setData(myLoans);
        } finally { setLoading(false); }
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="peminjam" />
            <main className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-white mb-6">Riwayat Peminjaman Saya</h1>

                {loading ? <p className="animate-pulse">Loading...</p> : (
                    <div className="overflow-x-auto glass-card rounded-xl">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="text-xs uppercase bg-white/5">
                                <tr>
                                    <th className="px-6 py-4">Alat</th>
                                    <th className="px-6 py-4">Tgl Pinjam</th>
                                    <th className="px-6 py-4">Tgl Kembali</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {data.length === 0 && (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Belum ada riwayat peminjaman.</td></tr>
                                )}
                                {data.map(row => (
                                    <tr key={row.id_pinjam} className="hover:bg-white/5">
                                        <td className="px-6 py-4 font-bold text-white">{row.alat.nama_alat}</td>
                                        <td className="px-6 py-4">{new Date(row.tanggal_pinjam).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{new Date(row.tanggal_kembali).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${row.status === 'disetujui' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    row.status === 'ditolak' ? 'bg-red-500/20 text-red-400' :
                                                        row.status === 'kembali' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {row.status}
                                            </span>
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
