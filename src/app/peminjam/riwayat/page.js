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
            // Tambahkan cache: 'no-store' agar data selalu fresh
            const res = await fetch('/api/peminjaman', { cache: 'no-store' });
            const json = await res.json();
            const all = Array.isArray(json) ? json : json.data || [];
            // Client-side filter for now
            const myLoans = all.filter(l => l.id_user === user.id_user);
            setData(myLoans);
        } finally { setLoading(false); }
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    return (
        <div className="min-h-screen">
            <Sidebar role="peminjam" />
            <main className="ml-64 p-8 animate-fade-in-up">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Riwayat Peminjaman Saya</h1>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl"></div>)}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Mobile/Card View for smaller screens or just a better layout for users */}
                        <div className="hidden md:block bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] animate-fade-in-up delay-100">
                            {data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4 opacity-70">📜</div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Riwayat</h3>
                                    <p className="text-slate-500">Kamu belum pernah melakukan peminjaman alat.</p>
                                    <a href="/peminjam/alat" className="mt-4 text-blue-600 font-bold hover:underline">Mulai Pinjam Sekarang →</a>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Alat</th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Jadwal Pinjam</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Info Denda</th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.map(row => (
                                                <tr key={row.id_pinjam} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                                                                🛠️
                                                            </div>
                                                            <span className="font-bold text-slate-700">{row.alat.nama_alat}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs border border-slate-200">
                                                            {row.jumlah} Unit
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col text-xs font-medium">
                                                            <span className="text-slate-500">Pinjam: <span className="text-slate-700">{new Date(row.tanggal_pinjam).toLocaleDateString('id-ID')}</span></span>
                                                            <span className="text-slate-500">Kembali: <span className="text-slate-700">{new Date(row.tanggal_kembali).toLocaleDateString('id-ID')}</span></span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${row.status === 'disetujui' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            row.status === 'ditolak' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                row.status === 'kembali' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                    row.status === 'menunggu_kembali' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {row.status === 'menunggu_kembali' ? 'Verifikasi' : row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {row.status === 'kembali' && row.pengembalian && row.pengembalian.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {row.pengembalian[0].denda > 0 ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-bold text-red-600">Rp {row.pengembalian[0].denda.toLocaleString('id-ID')}</span>
                                                                        <span className="text-[10px] text-red-400">Ada Denda</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                                        <span>✓</span> Aman
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 text-xs">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                            {/* Tombol Edit & Batal */}
                                                            {row.status === 'pengajuan' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleEditClick(row)}
                                                                        className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition"
                                                                        title="Edit"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCancel(row.id_pinjam)}
                                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                                        title="Batalkan"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </>
                                                            )}

                                                            {/* Tombol Kembalikan */}
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
                                                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5"
                                                                >
                                                                    🔄 Kembalikan
                                                                </button>
                                                            )}

                                                            {/* Tombol Cetak */}
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedLoanForPrint(row);
                                                                        setShowCetakPeminjaman(true);
                                                                    }}
                                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                    title="Cetak Bukti Peminjaman"
                                                                >
                                                                    🖨️
                                                                </button>
                                                                {row.status === 'kembali' && row.pengembalian && row.pengembalian.length > 0 && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedLoanForPrint(row);
                                                                            setShowCetakPengembalian(true);
                                                                        }}
                                                                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                                        title="Cetak Bukti Pengembalian"
                                                                    >
                                                                        🧾
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Mobile Card View (Visible on small screens) */}
                        <div className="md:hidden space-y-4">
                            {data.length === 0 && (
                                <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                                    <p className="text-slate-500 font-medium">Belum ada riwayat.</p>
                                </div>
                            )}
                            {data.map(row => (
                                <div key={row.id_pinjam} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{row.alat.nama_alat}</h4>
                                            <p className="text-xs text-slate-500 mt-1">{row.jumlah} Unit</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${row.status === 'disetujui' ? 'bg-emerald-100 text-emerald-600' :
                                            row.status === 'ditolak' ? 'bg-red-100 text-red-600' :
                                                row.status === 'kembali' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-amber-100 text-amber-600'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <p className="text-slate-400 mb-1">Pinjam</p>
                                            <p className="font-semibold">{new Date(row.tanggal_pinjam).toLocaleDateString('id-ID')}</p>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-lg">
                                            <p className="text-slate-400 mb-1">Kembali</p>
                                            <p className="font-semibold">{new Date(row.tanggal_kembali).toLocaleDateString('id-ID')}</p>
                                        </div>
                                    </div>

                                    {row.status === 'disetujui' && (
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Ajukan pengembalian alat ini?')) return;
                                                // reuse logic...
                                                alert('Fitur mobile sama dengan desktop (simulasi)');
                                            }}
                                            className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20"
                                        >
                                            🔄 Kembalikan Sekarang
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MODAL EDIT */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-fade-in-up">
                            <h2 className="text-xl font-bold mb-4 text-slate-800">Ubah Data Peminjaman</h2>
                            <form onSubmit={handleSubmitEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tanggal Pinjam</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={editForm.tglPinjam}
                                        onChange={e => setEditForm({ ...editForm, tglPinjam: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tanggal Kembali</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        value={editForm.tglKembali}
                                        onChange={e => setEditForm({ ...editForm, tglKembali: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jumlah</label>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => setEditForm({ ...editForm, jumlah: Math.max(1, (editForm.jumlah || 1) - 1) })} className="w-8 h-8 rounded bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">-</button>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-20 text-center px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-800"
                                            value={editForm.jumlah || 1}
                                            onChange={e => setEditForm({ ...editForm, jumlah: Math.max(1, parseInt(e.target.value) || 1) })}
                                            required
                                        />
                                        <button type="button" onClick={() => setEditForm({ ...editForm, jumlah: (editForm.jumlah || 1) + 1 })} className="w-8 h-8 rounded bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">+</button>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
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
