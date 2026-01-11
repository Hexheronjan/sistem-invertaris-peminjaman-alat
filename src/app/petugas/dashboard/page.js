'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function PetugasDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="petugas" />

            <main className="ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Halo, Petugas</h1>
                    <p className="text-slate-400">Siap melayani peminjaman hari ini?</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Stok Alat" value={stats?.total_alat || '-'} icon="📦" color="bg-emerald-500" />
                    <StatCard title="Peminjaman Pending" value={stats?.active_loans || '-'} icon="⏳" color="bg-amber-500" />
                    <StatCard title="Perlu Dikembalikan" value="0" icon="⚠️" color="bg-rose-500" />
                </div>

                <div className="p-6 glass-card rounded-2xl">
                    <h3 className="text-xl font-semibold mb-4 text-white">Antrian Verifikasi</h3>
                    <p className="text-slate-500">Tidak ada pengajuan baru.</p>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="p-6 glass-card rounded-2xl flex items-center justify-between group hover:bg-slate-800/80 transition">
            <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
                <h4 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition">{value}</h4>
            </div>
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-xl shadow-lg shadow-${color}/20`}>
                {icon}
            </div>
        </div>
    );
}
