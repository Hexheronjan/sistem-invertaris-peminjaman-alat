'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function LaporanPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/peminjaman')
            .then(res => res.json())
            .then(json => {
                const all = Array.isArray(json) ? json : json.data || [];
                setData(all);
            })
            .finally(() => setLoading(false));
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <div className="print:hidden">
                <Sidebar role="petugas" />
            </div>

            <main className="ml-64 p-8 print:ml-0 print:p-0 print:bg-white print:text-black">
                <div className="flex justify-between items-center mb-8 print:mb-4">
                    <div className="print:hidden">
                        <h1 className="text-3xl font-bold text-white">Laporan Peminjaman</h1>
                        <p className="text-slate-400">Rekapitulasi data peminjaman alat.</p>
                    </div>
                    <div className="hidden print:block text-center w-full mb-6">
                        <h1 className="text-2xl font-bold">LAPORAN PEMINJAMAN ALAT</h1>
                        <p className="text-sm">SMK Telkom Malang - Inventaris Lab</p>
                        <hr className="mt-2 border-black" />
                    </div>
                    <button
                        onClick={handlePrint}
                        className="print:hidden px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 shadow-lg"
                    >
                        🖨️ Cetak PDF
                    </button>
                </div>

                {loading ? <p className="print:hidden">Loading...</p> : (
                    <div className="overflow-x-auto glass-card rounded-xl print:shadow-none print:border print:border-black print:rounded-none">
                        <table className="w-full text-left text-sm text-slate-300 print:text-black">
                            <thead className="text-xs uppercase bg-white/5 print:bg-gray-200 print:font-bold">
                                <tr>
                                    <th className="px-6 py-4 border-b border-slate-700 print:border-black">No</th>
                                    <th className="px-6 py-4 border-b border-slate-700 print:border-black">Peminjam</th>
                                    <th className="px-6 py-4 border-b border-slate-700 print:border-black">Alat</th>
                                    <th className="px-6 py-4 border-b border-slate-700 print:border-black">Tgl Pinjam</th>
                                    <th className="px-6 py-4 border-b border-slate-700 print:border-black">Tgl Kembali</th>
                                    <th className="px-6 py-4 border-b border-slate-700 print:border-black">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 print:divide-gray-300">
                                {data.map((row, i) => (
                                    <tr key={row.id_pinjam} className="hover:bg-white/5 print:hover:bg-transparent">
                                        <td className="px-6 py-4 print:py-2">{i + 1}</td>
                                        <td className="px-6 py-4 print:py-2 font-medium text-white print:text-black">{row.user.nama}</td>
                                        <td className="px-6 py-4 print:py-2">{row.alat.nama_alat}</td>
                                        <td className="px-6 py-4 print:py-2">{new Date(row.tanggal_pinjam).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 print:py-2">{new Date(row.tanggal_kembali).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 print:py-2 uppercase font-bold text-xs">{row.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
