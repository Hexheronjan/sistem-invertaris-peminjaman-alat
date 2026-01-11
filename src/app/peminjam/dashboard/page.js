'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function PeminjamDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Peminjam gets limited/personal stats if API supported query, for now global stats shown
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="peminjam" />

            <main className="ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard Peminjam</h1>
                    <p className="text-slate-400">Cari alat yang kamu butuhkan di sini.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <StatCard title="Alat Tersedia" value={stats?.total_alat || '-'} icon="🔍" color="bg-blue-500" />
                    <StatCard title="Pinjaman Saya" value="0" icon="🎒" color="bg-indigo-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a href="/peminjam/alat" className="p-6 glass-card rounded-2xl hover:bg-slate-800 transition group cursor-pointer border border-dashed border-slate-700 hover:border-blue-500">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 mb-2">Pinjam Alat Baru +</h3>
                        <p className="text-sm text-slate-500">Jelajahi katalog alat dan ajukan peminjaman.</p>
                    </a>
                    <div className="p-6 glass-card rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-2">Status Terkini</h3>
                        <p className="text-sm text-slate-500">Kamu tidak memiliki tanggungan peminjaman.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="p-6 glass-card rounded-2xl flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
                <h4 className="text-2xl font-bold text-white">{value}</h4>
            </div>
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-xl shadow-lg shadow-${color}/20`}>
                {icon}
            </div>
        </div>
    );
}
