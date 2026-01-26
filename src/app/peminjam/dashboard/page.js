'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function PeminjamDashboard() {
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        // Peminjam gets limited/personal stats if API supported query, for now global stats shown
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error);
    }, []);

    return (
        <div className="min-h-screen bg-transparent">
            <Sidebar role="peminjam" />

            <main className="ml-72 p-8 transition-all duration-300">
                {/* [1] JUDUL DASHBOARD */}
                <header className="mb-10 animate-fade-in-up">
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
                        Halo, <span className="text-blue-600">{user?.nama || 'Peminjam'}</span>! 👋
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">Selamat datang kembali. Temukan alat yang kamu butuhkan hari ini.</p>
                </header>

                {/* [2] GRID KOTAK ATAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 animate-fade-in-up delay-100">
                    <StatCard
                        title="Alat Tersedia"
                        value={stats?.total_alat || '-'}
                        icon={<span className="text-2xl">🔍</span>}
                        color="from-blue-500 to-blue-600"
                        trend="Siap Dipinjam"
                    />
                    <StatCard
                        title="Pinjaman Saya"
                        value="0"
                        icon={<span className="text-2xl">🎒</span>}
                        color="from-indigo-500 to-indigo-600"
                        trend="Sedang Aktif"
                    />
                </div>

                {/* [3] GRID KOTAK BAWAH (MENU CEPAT) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up delay-200">
                    {/* Kotak Pinjam Alat Baru (Interactive) */}
                    <a href="/peminjam/alat" className="group relative p-8 glass-card rounded-2xl hover:border-blue-400/50 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex items-start gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                🚀
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition mb-2">Pinjam Alat Baru</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">Jelajahi katalog alat terbaru kami dan ajukan peminjaman dengan mudah dan cepat.</p>
                                <span className="inline-flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                    Mulai Peminjaman <span className="ml-1">→</span>
                                </span>
                            </div>
                        </div>
                    </a>

                    {/* Kotak Informasi Status (Statis) */}
                    <div className="p-8 glass-card rounded-2xl flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                                🔔
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Status Terkini</h3>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                            <p className="text-slate-500 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                Kamu tidak memiliki tanggungan peminjaman saat ini.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// [4] CETAKAN KOTAK (STAT CARD)
function StatCard({ title, value, icon, color, trend }) {
    return (
        <div className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110`} />

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
                    <h4 className="text-3xl font-extrabold text-slate-800 mb-1">{value}</h4>
                    <p className="text-xs font-medium text-slate-400">{trend}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
