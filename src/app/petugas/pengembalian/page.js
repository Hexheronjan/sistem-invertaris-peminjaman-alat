'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';

export default function PetugasPengembalianPage() {
    const [activeLoans, setActiveLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [isResultOpen, setIsResultOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchActive = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/peminjaman');
            const json = await res.json();
            const all = Array.isArray(json) ? json : json.data || [];
            setActiveLoans(all.filter(l => l.status === 'disetujui'));
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchActive(); }, []);

    const openReturnModal = (loan) => {
        setSelectedLoan(loan);
        setReturnDate(new Date().toISOString().split('T')[0]);
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
                    tanggal_dikembalikan: returnDate
                })
            });

            const json = await res.json();
            if (res.ok) {
                setIsFormOpen(false);
                setResult(json);
                setIsResultOpen(true);
                fetchActive();
            } else {
                alert(json.message || 'Gagal proses pengembalian');
            }
        } catch (e) { alert('Error'); }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Sidebar role="petugas" />
            <main className="ml-64 p-8">
                <h1 className="text-3xl font-bold text-white mb-6">Proses Pengembalian</h1>

                {loading ? <p className="animate-pulse">Loading...</p> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeLoans.length === 0 && <p className="text-slate-500">Tidak ada peminjaman aktif.</p>}

                        {activeLoans.map(loan => (
                            <div key={loan.id_pinjam} className="glass-card p-6 rounded-xl border border-blue-500/20">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{loan.user.nama}</h3>
                                        <p className="text-sm text-slate-400">@{loan.user.username}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded uppercase">Dipinjam</span>
                                </div>

                                <div className="space-y-2 text-sm mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Alat:</span>
                                        <span className="text-white font-medium">{loan.alat.nama_alat}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Rencana Kembali:</span>
                                        <span className="text-amber-300">{new Date(loan.tanggal_kembali).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button onClick={() => openReturnModal(loan)} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition">
                                    Proses Kembali
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Input & Result (Same as Admin) */}
                <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Konfirmasi">
                    <form onSubmit={handleReturn}>
                        <div className="mb-6">
                            <label className="block text-sm text-slate-400 mb-1">Tanggal Dikembalikan</label>
                            <input type="date" className="w-full px-4 py-2 bg-slate-800 border-slate-700 rounded-lg text-white" value={returnDate} onChange={e => setReturnDate(e.target.value)} required />
                        </div>
                        <button type="submit" className="w-full py-2 bg-emerald-600 rounded-lg text-white font-bold">Konfirmasi</button>
                    </form>
                </Modal>

                <Modal isOpen={isResultOpen} onClose={() => setIsResultOpen(false)} title="Hasil Pengembalian">
                    <div className="text-center py-4">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-white mb-2">Selesai</h3>
                        {result && (
                            <div className="mt-4 p-4 bg-slate-800 rounded-xl">
                                <p className="text-slate-400">Denda:</p>
                                <p className="text-3xl font-bold text-white">Rp {result.denda}</p>
                                <p className="text-sm text-slate-500 mt-1">Terlambat: {result.terlambat} hari</p>
                            </div>
                        )}
                        <button onClick={() => setIsResultOpen(false)} className="mt-6 px-6 py-2 bg-slate-700 text-white rounded-lg">Tutup</button>
                    </div>
                </Modal>
            </main>
        </div>
    );
}
