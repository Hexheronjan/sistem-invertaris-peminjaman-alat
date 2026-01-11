'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';

export default function KatalogAlatPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);

    // Modal Loan
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);
    const [dates, setDates] = useState({ start: '', end: '' });

    const router = useRouter();

    useEffect(() => {
        // Get User Session
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
            } finally { setLoading(false); }
        };
        fetchData();
    }, [search]);

    const handlePinjamClick = (tool) => {
        setSelectedTool(tool);
        setIsModalOpen(true);
    };

    const submitPinjam = async (e) => {
        e.preventDefault();
        if (!user) return;

        try {
            const res = await fetch('/api/peminjaman', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_user: user.id_user,
                    id_alat: selectedTool.id_alat,
                    tanggal_pinjam: dates.start,
                    tanggal_kembali: dates.end
                })
            });

            const json = await res.json();
            if (res.ok) {
                alert('Peminjaman berhasil diajukan! Menunggu persetujuan petugas.');
                setIsModalOpen(false);
                // Refresh stok logic if needed, but stok only reduces on Approval.
                // Just close modal.
            } else {
                alert(json.message || 'Gagal meminjam');
            }
        } catch (err) {
            alert('Terjadi kesalahan jaringan');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="peminjam" />
            <main className="ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Katalog Alat</h1>
                    <p className="text-slate-400">Temukan dan pinjam alat kebutuhanmu.</p>
                </header>

                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Cari alat apa?..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-xl px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 shadow-lg text-lg"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-800 rounded-2xl"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.map(tool => (
                            <div key={tool.id_alat} className="glass-card p-6 rounded-2xl group hover:bg-slate-800/80 transition flex flex-col">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition">{tool.nama_alat}</h3>
                                    <span className="text-xs font-medium px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md">
                                        {tool.kategori?.nama_kategori || 'Umum'}
                                    </span>
                                    <div className="mt-4 space-y-1 text-sm text-slate-400">
                                        <p>Stok: <span className="text-white font-medium">{tool.stok}</span></p>
                                        <p>Kondisi: <span className={`capitalize font-medium ${tool.kondisi === 'baik' ? 'text-emerald-400' : 'text-rose-400'}`}>{tool.kondisi}</span></p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePinjamClick(tool)}
                                    disabled={tool.stok <= 0}
                                    className="mt-6 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {tool.stok > 0 ? 'Pinjam Sekarang' : 'Stok Habis'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Borrow */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={`Ajukan Peminjaman: ${selectedTool?.nama_alat}`}
                >
                    <form onSubmit={submitPinjam} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Tanggal Pinjam</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                value={dates.start}
                                onChange={e => setDates({ ...dates, start: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Tanggal Kembali</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                                value={dates.end}
                                onChange={e => setDates({ ...dates, end: e.target.value })}
                                required
                            />
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">Batal</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">Ajukan</button>
                        </div>
                    </form>
                </Modal>

            </main>
        </div>
    );
}
