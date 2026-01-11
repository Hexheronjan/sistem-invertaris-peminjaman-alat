'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => setStats(data)) // { total_alat, total_user, active_loans, total_denda }
            .catch(console.error);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="admin" />

            <main className="ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Selamat Datang, Admin</h1>
                    <p className="text-slate-400">Ringkasan aktivitas aplikasi peminjaman alat.</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Alat" value={stats?.total_alat || '-'} icon="🛠️" color="bg-blue-500" />
                    <StatCard title="Total User" value={stats?.total_user || '-'} icon="👥" color="bg-purple-500" />
                    <StatCard title="Peminjaman Aktif" value={stats?.active_loans || '-'} icon="📋" color="bg-amber-500" />
                    <StatCard title="Total Denda" value={`Rp ${stats?.total_denda || 0}`} icon="💸" color="bg-red-500" />
                </div>

                {/* Quick Actions / Content Placeholder */}
                <div className="p-6 glass-card rounded-2xl">
                    <h3 className="text-xl font-semibold mb-4 text-white">Aktivitas Terbaru</h3>
                    <p className="text-slate-500 text-sm">Belum ada data visualisasi (Grafik).</p>
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
                <h4 className="text-2xl font-bold text-white group-hover:text-blue-400 transition">{value}</h4>
            </div>
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-xl shadow-lg shadow-${color}/20`}>
                {icon}
            </div>
        </div>
    );
}
