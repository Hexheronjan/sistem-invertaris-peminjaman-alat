'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastProvider';

export default function KatalogAlatPage() {
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);
    const { showToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);
    const [dates, setDates] = useState({ start: '', end: '', jumlah: 1 });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/alat?search=${search}`);
                const json = await res.json();
                setData(json.data || []);
            } catch (err) {
                showToast('Gagal memuat data', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [search]);

    const handlePinjamClick = (tool) => {
        setSelectedTool(tool);
        setIsModalOpen(true);
    };

    const submitPinjam = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast('Anda belum login!', 'error');
            return;
        }

        try {
            const payload = {
                id_user: user.id_user,
                id_alat: selectedTool.id_alat,
                tanggal_pinjam: dates.start,
                tanggal_kembali: dates.end,
                jumlah: dates.jumlah || 1
            };

            const res = await fetch('/api/peminjaman', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (res.ok) {
                showToast('Peminjaman berhasil diajukan!');
                setIsModalOpen(false);
            } else {
                showToast(json.message || 'Gagal meminjam', 'error');
            }
        } catch (err) {
            showToast('Terjadi kesalahan jaringan', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Sidebar role="peminjam" />

            <main className="ml-72 p-8 transition-all duration-300">
                {/* [1] HEADER & SEARCH - Floating Glass Style */}
                <header className="sticky top-4 z-20 mb-8 animate-fade-in-up">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/40 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="pl-2">
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Katalog Alat</h1>
                            <p className="text-slate-500 text-xs font-semibold">Cari dan pinjam alat berkualitas</p>
                        </div>

                        <div className="relative w-full max-w-lg">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nama alat ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </header>

                {/* [2] CATALOG GRID */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-4 h-[28rem] skeleton shadow-sm border border-slate-100"></div>
                        ))}
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up delay-100">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-6xl shadow-xl shadow-slate-200/50 mb-6 grayscale opacity-80">
                            🔍
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak Ditemukan</h3>
                        <p className="text-slate-500">Kami tidak dapat menemukan alat yang kamu cari.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up delay-200">
                        {data.map((tool, index) => (
                            <div
                                key={tool.id_alat}
                                className="group bg-white rounded-3xl p-4 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Image Container */}
                                <div className="h-56 w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl mb-5 overflow-hidden relative shadow-inner">
                                    {tool.foto ? (
                                        <img src={tool.foto} alt={tool.nama_alat} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-6xl opacity-20 grayscale group-hover:grayscale-0 transition-all duration-500">🛠️</div>
                                    )}

                                    {/* Availability Badge */}
                                    <div className="absolute top-3 right-3 z-10">
                                        {tool.stok > 0 ? (
                                            <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-emerald-600 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Ready
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-red-500 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                Habis
                                            </div>
                                        )}
                                    </div>

                                    {/* Overlay Gradient on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 px-2 pb-2">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                            {tool.kategori?.nama_kategori || 'Umum'}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                                            <span>⭐</span> 4.8
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {tool.nama_alat}
                                    </h3>

                                    <div className="flex items-center justify-between text-sm text-slate-500 mb-6">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                            <span>📦</span>
                                            <span className="font-bold text-slate-700">{tool.stok}</span> Unit
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${tool.kondisi === 'baik' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                            <span className="capitalize text-xs font-medium">{tool.kondisi}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handlePinjamClick(tool)}
                                        disabled={tool.stok <= 0}
                                        className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 group-hover/btn"
                                    >
                                        {tool.stok > 0 ? (
                                            <>
                                                <span>Ajukan Pinjam</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                            </>
                                        ) : (
                                            <span>Stok Habis</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Peminjaman Premium Style */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={`Ajukan Peminjaman`}
                >
                    <div className="p-1">
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl">
                                🛠️
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg mb-1">{selectedTool?.nama_alat}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Tersedia: {selectedTool?.stok}</span>
                                    <span className="text-xs text-slate-500 capitalize">{selectedTool?.kategori?.nama_kategori}</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submitPinjam} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-field text-xs uppercase tracking-wider text-slate-400">Mulai Pinjam</label>
                                    <input
                                        type="date"
                                        className="input-field font-semibold"
                                        value={dates.start}
                                        onChange={e => setDates({ ...dates, start: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label-field text-xs uppercase tracking-wider text-slate-400">Sampai</label>
                                    <input
                                        type="date"
                                        className="input-field font-semibold"
                                        value={dates.end}
                                        onChange={e => setDates({ ...dates, end: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label-field text-xs uppercase tracking-wider text-slate-400">Jumlah Alat</label>
                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setDates({ ...dates, jumlah: Math.max(1, (dates.jumlah || 1) - 1) })}
                                        className="w-12 h-12 rounded-xl bg-white shadow-sm hover:shadow-md text-slate-600 font-bold text-xl transition active:scale-90"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedTool?.stok || 1}
                                        className="flex-1 bg-transparent text-center font-bold text-2xl text-slate-800 outline-none"
                                        value={dates.jumlah || 1}
                                        onChange={e => {
                                            const val = parseInt(e.target.value);
                                            if (val > 0 && val <= (selectedTool?.stok || 1)) {
                                                setDates({ ...dates, jumlah: val });
                                            }
                                        }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setDates({ ...dates, jumlah: Math.min((selectedTool?.stok || 1), (dates.jumlah || 1) + 1) })}
                                        className="w-12 h-12 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 font-bold text-xl transition active:scale-90 hover:bg-slate-800"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transition transform active:scale-95"
                                >
                                    Konfirmasi Peminjaman
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </main>
        </div>
    );
}
