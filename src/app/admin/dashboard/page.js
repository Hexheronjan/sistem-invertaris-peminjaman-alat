'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Sidebar role="admin" />

            <main className="md:ml-72 p-8 transition-all duration-300">
                {/* [1] HEADER & WELCOME BANNER */}
                <header className="mb-10 animate-fade-in-up relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-10 shadow-xl shadow-blue-500/20 text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-white/10">
                                Administrator Area
                            </span>
                            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Selamat Datang, Admin 👋</h1>
                            <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
                                Pantau aktivitas inventaris, kelola peminjaman, dan cek status alat secara real-time dari dashboard ini.
                            </p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-blue-200 uppercase tracking-wider mb-1">Hari ini</p>
                            <p className="text-2xl font-bold">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </header>

                {/* [2] GRID STATISTIK PREMIUM */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fade-in-up delay-100">
                    <StatCard
                        title="Total Alat"
                        value={stats?.total_alat || '-'}
                        label="Unit"
                        icon="🛠️"
                        gradient="from-blue-500 to-cyan-500"
                        delay="0"
                    />
                    <StatCard
                        title="Total Pengguna"
                        value={stats?.total_user || '-'}
                        label="User"
                        icon="👥"
                        gradient="from-violet-500 to-purple-500"
                        delay="100"
                    />
                    <StatCard
                        title="Peminjaman Aktif"
                        value={stats?.active_loans || '-'}
                        label="Sedang Dipinjam"
                        icon="📋"
                        gradient="from-amber-400 to-orange-500"
                        delay="200"
                    />
                    <StatCard
                        title="Total Denda"
                        value={stats?.total_denda ? `Rp ${stats.total_denda.toLocaleString('id-ID')}` : 'Rp 0'}
                        label="Terakumulasi"
                        icon="💸"
                        gradient="from-rose-500 to-red-600"
                        delay="300"
                    />
                </div>

                {/* [3] CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in-up delay-200">
                    {/* Recent Activities Feed */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Aktivitas Terbaru</h3>
                                <p className="text-slate-500 text-sm mt-1">Monitor log penggunaan sistem terkini.</p>
                            </div>
                            <button className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                                Lihat Semua
                            </button>
                        </div>

                        {stats?.recent_logs?.length > 0 ? (
                            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 py-2">
                                {stats.recent_logs.map((log, idx) => (
                                    <div key={log.id_log} className="relative pl-8 group">
                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white ring-1 ring-slate-100 transition-all group-hover:scale-125 group-hover:ring-blue-200 ${idx === 0 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-300'}`}></div>

                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                            <div>
                                                <p className="text-sm font-medium text-slate-800 mb-1">
                                                    <span className="font-bold text-blue-700">{log.user?.username}</span> {log.aksi}
                                                </p>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
                                                    {log.user?.role || 'System'}
                                                </span>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                {new Date(log.tanggal).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-50">📜</div>
                                <p className="text-slate-500 font-medium">Belum ada aktivitas tercatat hari ini.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Access & System Info */}
                    <div className="flex flex-col gap-6">
                        {/* Quick Stats Mini Cards or Actions */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/10 transition-colors"></div>

                            <h3 className="text-lg font-bold mb-2 relative z-10">Laporan Cepat</h3>
                            <p className="text-slate-400 text-sm mb-6 relative z-10">Unduh ringkasan data bulanan untuk keperluan arsip.</p>

                            <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg relative z-10 flex items-center justify-center gap-2">
                                <span>📥</span> Download PDF
                            </button>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/30 flex-1">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                                Status Sistem
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-sm font-bold text-emerald-800">Server Online</span>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-600">99.9%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-sm font-bold text-blue-800">Database</span>
                                    </div>
                                    <span className="text-xs font-semibold text-blue-600">Connected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, label, icon, gradient, delay }) {
    return (
        <div className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group`} style={{ animationDelay: `${delay}ms` }}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 rounded-bl-full -mr-6 -mt-6 transition-all duration-500`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                {title === 'Peminjaman Aktif' && (
                    <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <h4 className="text-4xl font-extrabold text-slate-800 mb-1 tracking-tight">{value}</h4>
                <div className="flex justify-between items-end">
                    <p className="text-slate-500 text-sm font-medium">{title}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{label}</span>
                </div>
            </div>
        </div>
    );
}
