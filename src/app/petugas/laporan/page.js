'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import CetakLaporan from '@/components/CetakLaporan';

export default function LaporanPage() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Print Logic State
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [filterType, setFilterType] = useState('all'); // 'all', 'monthly', 'daily'
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [printPeriode, setPrintPeriode] = useState('');

    useEffect(() => {
        fetch('/api/peminjaman')
            .then(res => res.json())
            .then(json => {
                const all = Array.isArray(json) ? json : json.data || [];
                // Sort by ID descending (newest first)
                const sorted = all.sort((a, b) => b.id_pinjam - a.id_pinjam);
                setData(sorted);
                setFilteredData(sorted);
            })
            .finally(() => setLoading(false));
    }, []);

    // Pagination Calculations
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleOpenPrintModal = () => {
        setShowPrintModal(true);
    };

    const processPrint = () => {
        let result = [...data];
        let periodeLabel = 'Semua Data';

        if (filterType === 'monthly') {
            const [year, month] = selectedMonth.split('-');
            result = result.filter(item => {
                const d = new Date(item.tanggal_pinjam);
                return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month);
            });
            const dateObj = new Date(selectedMonth + '-01');
            periodeLabel = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        } else if (filterType === 'daily') {
            result = result.filter(item => {
                const d = new Date(item.tanggal_pinjam); // Asumsi filternya based on Tgl Pinjam
                const itemDate = d.toISOString().slice(0, 10);
                return itemDate === selectedDate;
            });
            const dateObj = new Date(selectedDate);
            periodeLabel = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        // Set filtered data for print component
        setFilteredData(result);
        setPrintPeriode(periodeLabel);

        // Switch modals
        setShowPrintModal(false);
        setShowPrintPreview(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="petugas" />

            <div className="ml-64 p-8 animate-fade-in-up">

                {/* Header Page */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Laporan Peminjaman</h1>
                        <p className="text-slate-500">Rekap data transaksi peminjaman alat.</p>
                    </div>
                    <button
                        onClick={handleOpenPrintModal}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition flex items-center gap-2 transform hover:scale-105 active:scale-95"
                    >
                        <span>🖨️</span> Menu Cetak
                    </button>
                </div>

                {/* Main Table */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-xs text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">No</th>
                                        <th className="px-6 py-4">Peminjam</th>
                                        <th className="px-6 py-4">Alat</th>
                                        <th className="px-6 py-4">Tgl Pinjam</th>
                                        <th className="px-6 py-4">Tgl Kembali</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((row, i) => (
                                            <tr key={row.id_pinjam} className="hover:bg-slate-50 transition duration-150">
                                                <td className="px-6 py-4 text-slate-400 font-mono">
                                                    {(currentPage - 1) * itemsPerPage + i + 1}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-800">
                                                    <div className="flex flex-col">
                                                        <span>{row.user?.nama}</span>
                                                        <span className="text-xs text-slate-400 font-normal">{row.user?.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
                                                        {row.alat?.nama_alat}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{new Date(row.tanggal_pinjam).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">{new Date(row.tanggal_kembali).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${row.status === 'kembali' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            row.status === 'disetujui' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                'bg-slate-50 text-slate-600 border-slate-200'
                                                        }`}>
                                                        {row.status === 'kembali' ? 'Selesai' : row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">
                                                Belum ada data transaksi.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                            <p className="text-slate-500">
                                Menampilkan <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, data.length)}</span> dari <span className="font-bold text-slate-700">{data.length}</span> data
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Previous
                                </button>

                                {/* Simple Page Selector using Select for space efficiency */}
                                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1">
                                    <span className="text-slate-600">Page</span>
                                    <select
                                        value={currentPage}
                                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                                        className="font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                                    >
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                    <span className="text-slate-600">of {totalPages}</span>
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PRINT CONFIGURATION MODAL */}
                {showPrintModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Pengaturan Cetak Laporan</h2>

                            <div className="space-y-4 mb-6">
                                {/* Option: Semua */}
                                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${filterType === 'all' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input
                                        type="radio"
                                        name="filterType"
                                        value="all"
                                        checked={filterType === 'all'}
                                        onChange={() => setFilterType('all')}
                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 font-semibold text-slate-700">Semua Data</span>
                                </label>

                                {/* Option: Bulanan */}
                                <div>
                                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${filterType === 'monthly' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input
                                            type="radio"
                                            name="filterType"
                                            value="monthly"
                                            checked={filterType === 'monthly'}
                                            onChange={() => setFilterType('monthly')}
                                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-3 font-semibold text-slate-700">Per Bulan</span>
                                    </label>
                                    {filterType === 'monthly' && (
                                        <div className="ml-4 mt-2 pl-4 border-l-2 border-slate-200 animate-slide-down">
                                            <input
                                                type="month"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                className="block w-full px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Option: Harian */}
                                <div>
                                    <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${filterType === 'daily' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input
                                            type="radio"
                                            name="filterType"
                                            value="daily"
                                            checked={filterType === 'daily'}
                                            onChange={() => setFilterType('daily')}
                                            className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-3 font-semibold text-slate-700">Per Tanggal</span>
                                    </label>
                                    {filterType === 'daily' && (
                                        <div className="ml-4 mt-2 pl-4 border-l-2 border-slate-200 animate-slide-down">
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="block w-full px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => setShowPrintModal(false)}
                                    className="px-5 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 font-bold transition"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={processPrint}
                                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition flex items-center gap-2"
                                >
                                    <span>🖨️</span> Lanjut Cetak
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* THE PORTAL PRINT COMPONENT */}
                {showPrintPreview && (
                    <CetakLaporan
                        data={filteredData}
                        periode={printPeriode}
                        petugas="Admin Petugas"
                        onClose={() => setShowPrintPreview(false)}
                    />
                )}
            </div>
        </div>
    );
}
