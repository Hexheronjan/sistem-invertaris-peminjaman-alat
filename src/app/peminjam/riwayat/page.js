'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import CetakBuktiPeminjaman from '@/components/CetakBuktiPeminjaman';
import CetakBuktiPengembalian from '@/components/CetakBuktiPengembalian';

export default function PeminjamRiwayatPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    // State untuk Edit
    const [editLoan, setEditLoan] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ tglPinjam: '', tglKembali: '', jumlah: 1 });

    // State untuk Cetak
    const [showCetakPeminjaman, setShowCetakPeminjaman] = useState(false);
    const [showCetakPengembalian, setShowCetakPengembalian] = useState(false);
    const [selectedLoanForPrint, setSelectedLoanForPrint] = useState(null);

    // Handle Batal (Delete)
    const handleCancel = async (id) => {
        if (!confirm('Yakin ingin membatalkan pengajuan ini?')) return;
        try {
            const res = await fetch(`/api/peminjaman/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Pengajuan berhasil dibatalkan.');
                fetchData();
            }
        } catch (e) { alert('Gagal membatalkan.'); }
    };

    // Handle Open Edit Modal
    const handleEditClick = (loan) => {
        setEditLoan(loan);
        setEditForm({
            tglPinjam: new Date(loan.tanggal_pinjam).toISOString().split('T')[0],
            tglKembali: new Date(loan.tanggal_kembali).toISOString().split('T')[0],
            jumlah: loan.jumlah || 1
        });
        setShowEditModal(true);
    };

    // Handle Submit Edit
    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/peminjaman/${editLoan.id_pinjam}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tanggal_pinjam: editForm.tglPinjam,
                    tanggal_kembali: editForm.tglKembali,
                    jumlah: editForm.jumlah
                })
            });
            if (res.ok) {
                alert('Data peminjaman berhasil diperbarui!');
                setShowEditModal(false);
                fetchData();
            } else {
                alert('Gagal mengupdate data.');
            }
        } catch (e) { alert('Terjadi kesalahan.'); }
    };

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) { router.push('/'); return; }
        setUser(JSON.parse(stored));
    }, []);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch('/api/peminjaman', { cache: 'no-store' });
            const json = await res.json();
            const all = Array.isArray(json) ? json : json.data || [];
            const myLoans = all.filter(l => l.id_user === user.id_user);
            setData(myLoans);
        } finally { setLoading(false); }
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Sidebar role="peminjam" />

            <main className="md:ml-72 p-8 transition-all duration-300">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Riwayat Peminjaman</h1>
                        <p className="text-slate-500 font-medium mt-1">Pantau status pengajuan dan riwayat peminjamanmu.</p>
                    </div>
                    {data.length > 0 && (
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-sm font-bold text-slate-700">{data.length} Transaksi</span>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white rounded-2xl shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in-up delay-100">
                        {data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4 grayscale opacity-50">📜</div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Riwayat</h3>
                                <p className="text-slate-500 mb-6">Kamu belum pernah melakukan peminjaman alat.</p>
                                <a href="/peminjam/alat" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition transform hover:-translate-y-1">
                                    Mulai Pinjam Sekarang →
                                </a>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {data.map((row, index) => (
                                    <div
                                        key={row.id_pinjam}
                                        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group relative overflow-hidden"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-2xl"></div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-2">
                                            {/* Info Alat */}
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-inner font-bold">
                                                    {row.alat?.nama_alat?.charAt(0) || '🛠️'}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                                        {row.alat?.nama_alat}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <span>📦</span> {row.jumlah} Unit
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span className="text-xs">{new Date(row.tanggal_pinjam).toLocaleDateString('id-ID')} - {new Date(row.tanggal_kembali).toLocaleDateString('id-ID')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex flex-col items-end gap-2 min-w-[140px]">
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border shadow-sm ${row.status === 'disetujui' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    row.status === 'ditolak' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        row.status === 'kembali' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            row.status === 'menunggu_kembali' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                    {row.status === 'menunggu_kembali' ? 'Verifikasi' : row.status}
                                                </span>

                                                {/* Denda Check */}
                                                {row.status === 'kembali' && row.pengembalian && row.pengembalian.length > 0 && (
                                                    row.pengembalian[0].denda > 0 ? (
                                                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                                            Denda: Rp {row.pengembalian[0].denda.toLocaleString('id-ID')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                                            <span>✓</span> Tepat Waktu
                                                        </span>
                                                    )
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 border-l border-slate-100 pl-6 md:min-w-[180px] justify-end">
                                                {row.status === 'pengajuan' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClick(row)}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-110 transition-all shadow-sm"
                                                            title="Edit Pengajuan"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(row.id_pinjam)}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all shadow-sm"
                                                            title="Batalkan"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </>
                                                )}

                                                {row.status === 'disetujui' && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm('Ajukan pengembalian alat ini?')) return;
                                                            try {
                                                                const res = await fetch(`/api/peminjaman/${row.id_pinjam}`, {
                                                                    method: 'PUT',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ status: 'menunggu_kembali' })
                                                                });

                                                                if (res.ok) {
                                                                    alert('Berhasil! Menunggu konfirmasi petugas.');
                                                                    window.location.reload();
                                                                } else {
                                                                    const err = await res.json();
                                                                    alert('Gagal: ' + err.message);
                                                                }
                                                            } catch (e) { alert('Gagal memproses request'); }
                                                        }}
                                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                                                    >
                                                        🔄 Kembalikan
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        setSelectedLoanForPrint(row);
                                                        setShowCetakPeminjaman(true);
                                                    }}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-md border border-slate-100 transition-all"
                                                    title="Cetak Bukti"
                                                >
                                                    🖨️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MODAL EDIT - Enhanced */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up border border-white/50">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-800">Edit Pengajuan</h2>
                                <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">✕</button>
                            </div>

                            <form onSubmit={handleSubmitEdit} className="space-y-5">
                                <div className="space-y-4">
                                    <div>
                                        <label className="label-field text-xs uppercase tracking-wider text-slate-400">Tanggal Pinjam</label>
                                        <input
                                            type="date"
                                            className="input-field font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-blue-500"
                                            value={editForm.tglPinjam}
                                            onChange={e => setEditForm({ ...editForm, tglPinjam: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label-field text-xs uppercase tracking-wider text-slate-400">Tanggal Kembali</label>
                                        <input
                                            type="date"
                                            className="input-field font-semibold bg-slate-50 border-transparent focus:bg-white focus:border-blue-500"
                                            value={editForm.tglKembali}
                                            onChange={e => setEditForm({ ...editForm, tglKembali: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label-field text-xs uppercase tracking-wider text-slate-400">Jumlah Alat</label>
                                        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                            <button type="button" onClick={() => setEditForm({ ...editForm, jumlah: Math.max(1, (editForm.jumlah || 1) - 1) })} className="w-10 h-10 rounded-xl bg-white shadow-sm font-bold text-slate-600 hover:scale-105 transition">-</button>
                                            <input
                                                type="number"
                                                min="1"
                                                className="flex-1 bg-transparent text-center font-bold text-xl outline-none"
                                                value={editForm.jumlah || 1}
                                                onChange={e => setEditForm({ ...editForm, jumlah: Math.max(1, parseInt(e.target.value) || 1) })}
                                                required
                                            />
                                            <button type="button" onClick={() => setEditForm({ ...editForm, jumlah: (editForm.jumlah || 1) + 1 })} className="w-10 h-10 rounded-xl bg-white shadow-sm font-bold text-slate-600 hover:scale-105 transition">+</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition transform active:scale-95"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Cetak Bukti Peminjaman */}
                {showCetakPeminjaman && selectedLoanForPrint && (
                    <CetakBuktiPeminjaman
                        peminjaman={selectedLoanForPrint}
                        onClose={() => {
                            setShowCetakPeminjaman(false);
                            setSelectedLoanForPrint(null);
                        }}
                    />
                )}

                {/* Modal Cetak Bukti Pengembalian */}
                {showCetakPengembalian && selectedLoanForPrint && selectedLoanForPrint.pengembalian && selectedLoanForPrint.pengembalian.length > 0 && (
                    <CetakBuktiPengembalian
                        peminjaman={selectedLoanForPrint}
                        pengembalian={selectedLoanForPrint.pengembalian[0]}
                        onClose={() => {
                            setShowCetakPengembalian(false);
                            setSelectedLoanForPrint(null);
                        }}
                    />
                )}
            </main>
        </div>
    );
}
