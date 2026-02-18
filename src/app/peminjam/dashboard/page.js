'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function PeminjamDashboard() {
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        // Time-based greeting
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Selamat Pagi');
        else if (hour < 15) setGreeting('Selamat Siang');
        else if (hour < 18) setGreeting('Selamat Sore');
        else setGreeting('Selamat Malam');

        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Sidebar role="peminjam" />

            <main className="md:ml-72 p-8 transition-all duration-300">
                {/* [1] HERO SECTION - Enhanced */}
                <header className="mb-10 animate-fade-in-up relative rounded-3xl bg-white p-8 border border-white/50 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100">
                                Member Area
                            </span>
                            <span className="text-slate-400 text-sm font-medium">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">
                            {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{user?.nama || 'Sobat'}</span>! 👋
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
                            Siap untuk berkarya hari ini? Cek ketersediaan alat terbaru dan kelola peminjamanmu dengan mudah di sini.
                        </p>
                    </div>
                </header>

                {/* [2] STATS GRID - Enhanced Visuals */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-in-up delay-100">
                    <StatCard
                        title="Alat Tersedia"
                        value={stats?.total_alat || '-'}
                        label="Unit Ready"
                        icon="✨"
                        gradient="from-blue-500 to-cyan-500"
                        delay="0"
                    />
                    <StatCard
                        title="Pinjaman Saya"
                        value="0"
                        label="Sedang Aktif"
                        icon="🎒"
                        gradient="from-violet-500 to-purple-500"
                        delay="100"
                    />
                    <StatCard
                        title="Riwayat"
                        value="0"
                        label="Total Transaksi"
                        icon="📜"
                        gradient="from-emerald-400 to-teal-500"
                        delay="200"
                    />
                </div>

                {/* [3] MAIN CONTENT - Interactive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up delay-200">

                    {/* Feature Card: Quick Borrow */}
                    <a href="/peminjam/alat" className="group relative p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-all duration-500 group-hover:scale-150" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                🚀
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-2">Pinjam Alat Baru</h3>
                            <p className="text-slate-500 leading-relaxed mb-6">
                                Butuh peralatan untuk praktikum atau project? Jelajahi katalog lengkap kami dan ajukan peminjaman sekarang.
                            </p>
                            <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-3 transition-all">
                                <span>Mulai Eksplorasi</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>
                        </div>
                    </a>

                    {/* Feature Card: Status/Activity Placeholder */}
                    <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-lg font-bold">
                                    🔔
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Aktivitas Terkini</h3>
                            </div>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">Hari Ini</span>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mb-3 shadow-sm grayscale opacity-30">
                                💤
                            </div>
                            <h4 className="text-slate-600 font-semibold mb-1">Tidak ada aktivitas baru</h4>
                            <p className="text-slate-400 text-sm max-w-xs">
                                Kamu belum melakukan aktivitas apapun hari ini. Mulai pinjam alat untuk melihat status di sini.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// [4] PREMIUM STAT CARD COMPONENT
function StatCard({ title, value, label, icon, gradient, delay }) {
    return (
        <div
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/30 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background Pattern */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 rounded-bl-full -mr-8 -mt-8 transition-all duration-500 ease-out transform group-hover:scale-110`} />

            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-2xl shadow-lg shadow-blue-500/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    {icon}
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                    {label}
                </span>
            </div>

            <div className="relative z-10">
                <h4 className="text-4xl font-black text-slate-800 mb-1 tracking-tight group-hover:text-blue-900 transition-colors">
                    {value}
                </h4>
                <p className="text-slate-500 text-sm font-semibold">{title}</p>
            </div>
        </div>
    );
}
