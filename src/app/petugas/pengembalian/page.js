'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import CetakBuktiPengembalian from '@/components/CetakBuktiPengembalian';

export default function PetugasPengembalianPage() {
    const [activeLoans, setActiveLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [isResultOpen, setIsResultOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // State baru untuk Denda Kerusakan & Detail Kondisi
    // const [isDamaged, setIsDamaged] = useState(false); // Deprecated in favor of itemConditions
    const [itemConditions, setItemConditions] = useState([]); // Array of 'baik' | 'rusak'
    const [dendaTambahan, setDendaTambahan] = useState('');
    const [deskripsi, setDeskripsi] = useState('');

    // State untuk Cetak
    const [showCetakPengembalian, setShowCetakPengembalian] = useState(false);
    const [peminjamanForPrint, setPeminjamanForPrint] = useState(null);
    const [pengembalianForPrint, setPengembalianForPrint] = useState(null);

    const fetchActive = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/peminjaman');
            const json = await res.json();
            const all = Array.isArray(json) ? json : json.data || [];
            // Tampilkan yang 'disetujui' (Aktif) ATAU 'menunggu_kembali' (Request User)
            setActiveLoans(all.filter(l => l.status === 'disetujui' || l.status === 'menunggu_kembali'));
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchActive(); }, []);

    const openReturnModal = (loan) => {
        setSelectedLoan(loan);
        setReturnDate(new Date().toISOString().split('T')[0]);

        // Initialize conditions for each item (default: all 'baik')
        const qty = loan.jumlah || 1;
        setItemConditions(Array(qty).fill('baik'));

        setDendaTambahan('');
        setDeskripsi('');
        setIsFormOpen(true);
    };

    const handleConditionChange = (index, status) => {
        const newConditions = [...itemConditions];
        newConditions[index] = status;
        setItemConditions(newConditions);
    };

    const damagedCount = itemConditions.filter(c => c === 'rusak').length;
    const isDamaged = damagedCount > 0;

    const handleReturn = async (e) => {
        e.preventDefault();

        // Build detailed description
        let finalDeskripsi = deskripsi;
        if (selectedLoan.jumlah > 1 || isDamaged) {
            const detailStr = itemConditions.map((c, i) => `Unit ${i + 1}: ${c.toUpperCase()}`).join(', ');
            finalDeskripsi = `${deskripsi ? deskripsi + '. ' : ''}Detail Kondisi: ${detailStr}. Total Rusak: ${damagedCount}`;
        }

        try {
            const res = await fetch('/api/pengembalian', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_pinjam: selectedLoan.id_pinjam,
                    tanggal_dikembalikan: returnDate,
                    denda_tambahan: isDamaged ? dendaTambahan : 0,
                    deskripsi: finalDeskripsi,
                    kondisi_akhir: isDamaged ? 'rusak' : 'baik' // Kirim kondisi_akhir agar API memindahkan stok jika rusak
                })
            });

            const json = await res.json();
            if (res.ok) {
                setIsFormOpen(false);
                setResult(json);
                setIsResultOpen(true);
                // Simpan data untuk cetak - gunakan data selectedLoan yang lengkap
                setPeminjamanForPrint({
                    ...selectedLoan,
                    status: 'kembali' // Update status untuk cetak
                });
                setPengembalianForPrint({
                    denda: json.denda || 0,
                    tanggal_dikembalikan: returnDate,
                    deskripsi: finalDeskripsi // Pass description for receipt if needed
                });
                fetchActive();
            } else {
                alert(json.message || 'Gagal proses pengembalian');
            }
        } catch (e) { alert('Error'); }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Sidebar role="petugas" />

            <main className="ml-64 p-8 transition-all duration-300">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Proses Pengembalian</h1>
                        <p className="text-slate-500 mt-1">Kelola pengembalian alat dan perhitungan denda.</p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-sm font-medium text-slate-600 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {activeLoans.length} Antrian Pengembalian
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-slate-200 rounded-2xl"></div>
                        ))}
                    </div>
                ) : activeLoans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm animate-fade-in-up text-center px-4">
                        <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mb-6">
                            📝
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak Ada Peminjaman Aktif</h3>
                        <p className="text-slate-500 max-w-md">Saat ini tidak ada siswa yang sedang meminjam alat. Semua aman terkendali!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up delay-100">
                        {activeLoans.map(loan => (
                            <div key={loan.id_pinjam} className={`group bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] border transition-all duration-300 relative overflow-hidden ${loan.status === 'menunggu_kembali' ? 'border-orange-300 ring-4 ring-orange-50' : 'border-slate-100'}`}>
                                {/* Decorative Gradient */}
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${loan.status === 'menunggu_kembali' ? 'from-orange-500 to-red-500' : 'from-blue-500 to-indigo-500'}`}></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                                            {loan.user?.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{loan.user?.nama || 'Unknown'}</h3>
                                            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-0.5">@{loan.user?.username || 'user'}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-lg uppercase border ${loan.status === 'menunggu_kembali' ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                        {loan.status === 'menunggu_kembali' ? 'Minta Kembali' : 'Aktif'}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                        <div className="text-xl">🛠️</div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Alat</p>
                                            <p className="text-sm font-semibold text-slate-700">{loan.alat.nama_alat} <span className="text-slate-400 text-xs">({loan.jumlah} Unit)</span></p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm px-1">
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1">Pinjam</p>
                                            <p className="font-medium text-slate-600">{new Date(loan.tanggal_pinjam).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 text-xs mb-1">Jatuh Tempo</p>
                                            <p className={`font-bold ${new Date() > new Date(loan.tanggal_kembali) ? 'text-red-500' : 'text-emerald-600'}`}>
                                                {new Date(loan.tanggal_kembali).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openReturnModal(loan)}
                                    className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:translate-y-[-2px] shadow-lg shadow-slate-200"
                                >
                                    <span>Proses Pengembalian</span>
                                    <span className="text-slate-400 group-hover:text-white transition">→</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Input */}
                <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Konfirmasi Pengembalian">
                    <form onSubmit={handleReturn} className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                            <p className="text-sm text-blue-800 mb-1">Anda akan memproses pengembalian alat:</p>
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-blue-900 text-lg">{selectedLoan?.alat?.nama_alat}</p>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                    Total: {selectedLoan?.jumlah || 1} Unit
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Dikembalikan</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-slate-700"
                                value={returnDate}
                                onChange={e => setReturnDate(e.target.value)}
                                required
                            />
                        </div>

                        {/* Validasi Kondisi Per Item */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Cek Kondisi Barang</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {itemConditions.map((condition, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                        <span className="text-sm font-medium text-slate-600">Unit ke-{index + 1}</span>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleConditionChange(index, 'baik')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${condition === 'baik' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 ring-2 ring-emerald-500/20' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'}`}
                                            >
                                                ✅ Baik
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleConditionChange(index, 'rusak')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${condition === 'rusak' ? 'bg-red-100 text-red-700 border border-red-200 ring-2 ring-red-500/20' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'}`}
                                            >
                                                ⚠️ Rusak
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Kerusakan */}
                            {isDamaged ? (
                                <div className="mt-4 pt-4 border-t border-slate-200 animate-slide-down">
                                    <div className="flex items-center gap-2 text-red-600 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
                                        <span>⚠️</span>
                                        <span className="text-sm font-bold">Terdeteksi {damagedCount} item rusak. Harap input denda.</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Nominal Denda Kerusakan (Total)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2 text-slate-400">Rp</span>
                                                <input
                                                    type="number"
                                                    className="w-full pl-10 pr-4 py-2 bg-white border border-red-300 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                                                    placeholder="0"
                                                    value={dendaTambahan}
                                                    onChange={e => setDendaTambahan(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-1">Keterangan Kondisi</label>
                                            <textarea
                                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                                                placeholder="Jelaskan kerusakan (misal: layar pecah, unit 2 mati total)"
                                                value={deskripsi}
                                                onChange={e => setDeskripsi(e.target.value)}
                                                rows="2"
                                                required
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-3 text-center">
                                    <p className="text-xs text-emerald-600 font-medium bg-emerald-50 py-2 rounded-lg border border-emerald-100">
                                        ✨ Semua item dalam kondisi baik
                                    </p>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-200 transform active:scale-95">
                            Konfirmasi Pengembalian
                        </button>
                    </form>
                </Modal>


                {/* Result Modal */}
                <Modal isOpen={isResultOpen} onClose={() => setIsResultOpen(false)} title="Laporan Pengembalian">
                    <div className="text-center py-6">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-bounce">
                            ✅
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Pengembalian Berhasil!</h3>
                        <p className="text-slate-500 mb-8">Stok alat telah diperbarui otomatis.</p>

                        {result && (
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-2">
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Status Denda</p>
                                        <p className={`text-xl font-bold ${result.denda > 0 ? 'text-red-500' : 'text-slate-700'}`}>
                                            {result.denda > 0 ? 'TERKENA DENDA' : 'BEBAS DENDA'}
                                        </p>
                                    </div>
                                    <div className="text-center p-2 border-l border-slate-200">
                                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Bayar</p>
                                        <p className="text-xl font-bold text-slate-800">Rp {result.denda.toLocaleString()}</p>
                                    </div>
                                </div>
                                {result.terlambat > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <p className="text-sm text-red-500 font-medium">⚠️ Terlambat {result.terlambat} hari</p>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsResultOpen(false);
                                    setShowCetakPengembalian(true);
                                }}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
                            >
                                🖨️ Cetak Bukti
                            </button>
                            <button
                                onClick={() => setIsResultOpen(false)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Modal Cetak Bukti Pengembalian */}
                {showCetakPengembalian && peminjamanForPrint && pengembalianForPrint && (
                    <CetakBuktiPengembalian
                        peminjaman={peminjamanForPrint}
                        pengembalian={pengembalianForPrint}
                        onClose={() => {
                            setShowCetakPengembalian(false);
                            setPeminjamanForPrint(null);
                            setPengembalianForPrint(null);
                        }}
                    />
                )}
            </main>
        </div>
    );
}
