'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';

export default function PengembalianPage() {
    const [activeLoans, setActiveLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State for Result
    const [result, setResult] = useState(null); // { denda, terlambat_hari }
    const [isResultOpen, setIsResultOpen] = useState(false);

    // Return Form Modal
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [condition, setCondition] = useState('baik'); // baik | rusak | hilang
    const [description, setDescription] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchActive = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/peminjaman');
            const json = await res.json();
            const all = Array.isArray(json) ? json : json.data || [];
            // Filter only 'disetujui' (active)
            setActiveLoans(all.filter(l => l.status === 'disetujui'));
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchActive(); }, []);

    const openReturnModal = (loan) => {
        setSelectedLoan(loan);
        setReturnDate(new Date().toISOString().split('T')[0]);
        setCondition('baik');
        setDescription('');
        setIsFormOpen(true);
    };

    const handleReturn = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/pengembalian', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_pinjam: selectedLoan.id_pinjam,
                    tanggal_dikembalikan: returnDate,
                    kondisi_akhir: condition,
                    deskripsi: description
                })
            });

            const json = await res.json();
            if (res.ok) {
                setIsFormOpen(false);
                setResult(json);
                setIsResultOpen(true);
                fetchActive(); // Refresh list
            } else {
                alert(json.message || 'Gagal proses pengembalian');
            }
        } catch (e) { alert('Error network'); }
    };

    return (
        <div className="min-h-screen">
            <Sidebar role="admin" />
            <main className="ml-64 p-8 animate-fade-in-up">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Proses Pengembalian Alat</h1>

                {loading ? <p className="animate-pulse text-slate-500">Loading...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeLoans.length === 0 && <p className="text-slate-500">Tidak ada peminjaman aktif/belum kembali.</p>}

                        {activeLoans.map(loan => (
                            <div key={loan.id_pinjam} className="glass-card p-6 rounded-xl shadow-lg border border-slate-200/50 hover:shadow-xl transition duration-300 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition">{loan.user.nama}</h3>
                                        <p className="text-sm text-slate-500">@{loan.user.username}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded uppercase">
                                        Dipinjam
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Alat:</span>
                                        <span className="text-slate-800 font-medium">{loan.alat.nama_alat}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Tgl Pinjam:</span>
                                        <span className="text-slate-700">{new Date(loan.tanggal_pinjam).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Rencana Kembali:</span>
                                        <span className="text-amber-600 font-medium">{new Date(loan.tanggal_kembali).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openReturnModal(loan)}
                                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition transform group-hover:scale-[1.02]"
                                >
                                    Proses Kembali
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Input Tanggal */}
                <Modal
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    title="Konfirmasi Pengembalian"
                >
                    <form onSubmit={handleReturn}>
                        <p className="mb-4 text-slate-600">
                            Memproses pengembalian <strong>{selectedLoan?.alat?.nama_alat}</strong> dari <strong>{selectedLoan?.user?.nama}</strong>.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm text-slate-500 font-medium mb-1">Tanggal Dikembalikan Real</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-800"
                                value={returnDate}
                                onChange={e => setReturnDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm text-slate-500 font-medium mb-1">Kondisi Barang</label>
                            <select
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-800"
                                value={condition}
                                onChange={e => setCondition(e.target.value)}
                            >
                                <option value="baik">Baik</option>
                                <option value="rusak">Rusak (Perlu Perbaikan)</option>
                                <option value="hilang">Hilang</option>
                            </select>
                        </div>
                        {condition !== 'baik' && (
                            <div className="mb-6 animate-fade-in-up">
                                <label className="block text-sm text-slate-500 font-medium mb-1">Keterangan Kerusakan/Kehilangan</label>
                                <textarea
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-800"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Jelaskan kerusakan atau kronologi kehilangan..."
                                    rows="3"
                                    required
                                />
                            </div>
                        )}
                        <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition">
                            Konfirmasi & Hitung Denda
                        </button>
                    </form>
                </Modal>

                {/* Modal Result (Denda) */}
                <Modal
                    isOpen={isResultOpen}
                    onClose={() => setIsResultOpen(false)}
                    title="Pengembalian Berhasil"
                >
                    <div className="text-center py-4">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Alat Telah Dikembalikan</h3>

                        {result && result.denda > 0 ? (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-xl mt-4">
                                <p className="text-red-500 text-sm uppercase font-bold">Keterlambatan</p>
                                <p className="text-3xl font-bold text-red-600">{result.terlambat} Hari</p>
                                <div className="h-px bg-red-200 my-2"></div>
                                <p className="text-red-500 text-sm uppercase font-bold">Total Denda</p>
                                <p className="text-4xl font-extrabold text-slate-800">Rp {result.denda}</p>
                            </div>
                        ) : (
                            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mt-4">
                                <p className="text-emerald-600 font-bold text-lg">Tepat Waktu!</p>
                                <p className="text-slate-500">Tidak ada denda.</p>
                            </div>
                        )}

                        <button
                            onClick={() => setIsResultOpen(false)}
                            className="mt-6 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition"
                        >
                            Tutup
                        </button>
                    </div>
                </Modal>

            </main>
        </div>
    );
}
