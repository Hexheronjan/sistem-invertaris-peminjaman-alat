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
        <div className="min-h-screen bg-transparent">
            <Sidebar role="petugas" />

            <main className="md:ml-72 p-8 transition-all duration-300">
                {/* [1] JUDUL HALAMAN */}
                <header className="mb-10 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Halo, Petugas</h1>
                            <p className="text-slate-500 font-medium">Siap melayani peminjaman hari ini?</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                Mode Petugas
                            </span>
                        </div>
                    </div>
                </header>

                {/* [2] STATISTIK UTAMA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-in-up delay-100">
                    <StatCard
                        title="Stok Alat"
                        value={stats?.total_alat || '-'}
                        icon={<span className="text-2xl">📦</span>}
                        color="from-emerald-500 to-emerald-600"
                        trend="Tersedia"
                    />
                    <StatCard
                        title="Peminjaman Pending"
                        value={stats?.pending_requests || '0'}
                        icon={<span className="text-2xl">⏳</span>}
                        color="from-amber-500 to-amber-600"
                        trend="Perlu Verifikasi"
                    />
                    <StatCard
                        title="Perlu Dikembalikan"
                        value="0"
                        icon={<span className="text-2xl">⚠️</span>}
                        color="from-rose-500 to-rose-600"
                        trend="Jatuh Tempo"
                    />
                </div>

                {/* [3] DAFTAR ANTRIAN VERIFIKASI */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up delay-200">
                    <div className="lg:col-span-2 glass-card p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Antrian Verifikasi Terbaru</h3>
                            <a href="/petugas/verifikasi" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">Lihat Semua →</a>
                        </div>

                        {stats?.pending_queue?.length > 0 ? (
                            <div className="space-y-4">
                                {stats.pending_queue.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-inner">
                                                ⏳
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 group-hover:text-blue-700 transition">{item.user?.nama}</p>
                                                <p className="text-sm text-slate-500">Meminjam <span className="font-medium text-slate-700">{item.alat?.nama_alat}</span></p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow-blue-500/30">
                                            Proses
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                <span className="text-4xl mb-3 grayscale opacity-50">✅</span>
                                <p className="text-slate-600 font-medium">Semua Sudah Bersih!</p>
                                <p className="text-slate-400 text-sm">Tidak ada pengajuan peminjaman baru saat ini.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Access Sidebar */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                            <h3 className="font-bold text-lg mb-2">Akses Cepat</h3>
                            <p className="text-blue-100 text-sm mb-6">Pintasan untuk tugas operasional harian petugas.</p>

                            <div className="space-y-3">
                                <a href="/petugas/verifikasi" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl font-medium text-sm transition flex items-center gap-3">
                                    <span>✅</span> Verifikasi Peminjaman
                                </a>
                                <a href="/petugas/pengembalian" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl font-medium text-sm transition flex items-center gap-3">
                                    <span>🔄</span> Proses Pengembalian
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// [4] KOMPONEN CETAKAN KOTAK
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
