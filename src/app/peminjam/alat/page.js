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
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="peminjam" />

            <main className="ml-72 p-8 transition-all duration-300">
                {/* Header */}
                <header className="section-header animate-fade-in-up">
                    <div>
                        <h1 className="section-title">Katalog Alat</h1>
                        <p className="text-slate-500 mt-1">Temukan dan pinjam alat pilihanmu</p>
                    </div>
                </header>

                {/* Search Bar */}
                <div className="mb-8 animate-fade-in-up delay-100">
                    <div className="relative max-w-2xl">
                        <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari alat yang kamu butuhkan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-800 shadow-sm placeholder:text-slate-400 transition"
                        />
                    </div>
                </div>

                {/* Catalog Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="premium-card p-6 h-96 skeleton"></div>
                        ))}
                    </div>
                ) : data.length === 0 ? (
                    <div className="premium-card animate-fade-in-up delay-200">
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <h3 className="empty-state-title">Tidak Ditemukan</h3>
                            <p className="empty-state-description">Coba kata kunci lain untuk mencari alat</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
                        {data.map(tool => (
                            <div key={tool.id_alat} className="premium-card p-6 flex flex-col group">
                                {/* Image */}
                                <div className="h-48 w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mb-4 overflow-hidden relative">
                                    {tool.foto ? (
                                        <img src={tool.foto} alt={tool.nama_alat} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-6xl opacity-20">🛠️</div>
                                    )}
                                    {tool.stok > 0 ? (
                                        <div className="absolute top-3 right-3">
                                            <span className="badge badge-success shadow-lg">Tersedia</span>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
                                            <span className="badge badge-danger shadow-lg">Stok Habis</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="mb-3">
                                        <span className="badge badge-primary text-[10px]">{tool.kategori?.nama_kategori || 'Umum'}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                                        {tool.nama_alat}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <span>📦</span>
                                            <span className="font-semibold text-slate-700">{tool.stok} Unit</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className={`w-2 h-2 rounded-full ${tool.kondisi === 'baik' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            <span className="capitalize">{tool.kondisi}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handlePinjamClick(tool)}
                                    disabled={tool.stok <= 0}
                                    className="mt-6 w-full py-3 rounded-xl bg- bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 transition-all duration-300 hover:scale-105 active:scale-95"
                                >
                                    {tool.stok > 0 ? '✨ Pinjam Sekarang' : '🚫 Tidak Tersedia'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Peminjaman */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={`Ajukan Peminjaman`}
                >
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-1">{selectedTool?.nama_alat}</h4>
                        <p className="text-sm text-blue-600">Stok tersedia: {selectedTool?.stok} unit</p>
                    </div>

                    <form onSubmit={submitPinjam} className="space-y-5">
                        <div>
                            <label className="label-field">Tanggal Pinjam</label>
                            <input
                                type="date"
                                className="input-field"
                                value={dates.start}
                                onChange={e => setDates({ ...dates, start: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="label-field">Tanggal Kembali</label>
                            <input
                                type="date"
                                className="input-field"
                                value={dates.end}
                                onChange={e => setDates({ ...dates, end: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="label-field">Jumlah</label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDates({ ...dates, jumlah: Math.max(1, (dates.jumlah || 1) - 1) })}
                                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedTool?.stok || 1}
                                    className="input-field flex-1 text-center"
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
                                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
                                >
                                    +
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Maksimal: {selectedTool?.stok} unit</p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                                Batal
                            </button>
                            <button type="submit" className="btn-primary flex-1">
                                Ajukan Peminjaman
                            </button>
                        </div>
                    </form>
                </Modal>
            </main>
        </div>
    );
}
