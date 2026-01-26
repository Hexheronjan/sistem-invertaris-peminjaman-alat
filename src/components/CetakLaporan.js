'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function CetakLaporan({ data, periode, petugas, onClose }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Lock body scroll for the modal view, but we must be careful not to break print
        // relying on CSS @media print to override this.
        document.body.style.overflow = 'hidden';

        // Auto print after mount
        const timer = setTimeout(() => {
            window.print();
        }, 800);

        return () => {
            document.body.style.overflow = 'unset';
            clearTimeout(timer);
        };
    }, []);

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] bg-white text-black font-serif print:static print:h-auto print:overflow-visible print:bg-white print:block">

            {/* Print Control Overlay (Hidden when printing) */}
            <div className="fixed top-0 left-0 right-0 p-4 bg-slate-900/95 text-white flex justify-between items-center print:hidden z-50 backdrop-blur-md shadow-md font-sans">
                <div>
                    <h2 className="text-lg font-bold">Preview Cetak Laporan</h2>
                    <p className="text-sm text-slate-300">Gunakan kertas A4 untuk hasil terbaik.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
                    >
                        <span>🖨️</span> Cetak Sekarang
                    </button>
                </div>
            </div>

            {/* Main Print Container (A4 Settings) */}
            {/* Using print:static to ensure it flows naturally in the document stream */}
            <div className="mx-auto bg-white min-h-screen pt-24 pb-20 print:p-0 print:pt-0 print:m-0 print:h-auto print:overflow-visible print:w-full print:static">
                <div id="laporan-print-area" className="p-12 print:p-0 max-w-[210mm] mx-auto bg-white print:w-full print:max-w-none print:static">

                    {/* KOP SURAT RESMI */}
                    <div className="relative border-b-[3px] border-double border-black pb-4 mb-6 flex flex-col items-center">
                        <div className="text-center leading-tight">
                            <h3 className="text-lg uppercase font-bold tracking-wide">Pemerintah Provinsi Jawa Timur</h3>
                            <h3 className="text-lg uppercase font-bold tracking-wide">Dinas Pendidikan</h3>
                            <h1 className="text-2xl font-black uppercase tracking-wider my-1">SMK NEGERI 1 JENANGAN</h1>
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-1">Inventaris Laboratorium Peralatan</h2>
                            <p className="text-xs font-normal italic">Jl. Niken Gandini No.98, Setono, Jenangan, Kab. Ponorogo, Jawa Timur 63492</p>
                            <p className="text-xs font-normal">Telp: (0352) 123456 | Email: info@smkn1jenangan.sch.id | Website: www.smkn1jenangan.sch.id</p>
                        </div>
                    </div>

                    {/* JUDUL LAPORAN */}
                    <div className="text-center mb-8 mt-6">
                        <h2 className="text-xl font-bold uppercase underline underline-offset-4 mb-2">Laporan Peminjaman Alat</h2>
                        <h3 className="text-base font-medium">Periode: {periode}</h3>
                    </div>

                    {/* TABEL DATA */}
                    <div className="w-full mb-8">
                        <table className="w-full border-collapse border border-black text-[11pt]">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black px-2 py-2 text-center w-10 font-bold">NO</th>
                                    <th className="border border-black px-3 py-2 text-left font-bold">NAMA PEMINJAM</th>
                                    <th className="border border-black px-3 py-2 text-left font-bold">NAMA ALAT</th>
                                    <th className="border border-black px-2 py-2 text-center w-32 font-bold">TGL PINJAM</th>
                                    <th className="border border-black px-2 py-2 text-center w-32 font-bold">TGL KEMBALI</th>
                                    <th className="border border-black px-2 py-2 text-center w-28 font-bold">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((item, index) => (
                                        <tr key={index} className="print:break-inside-avoid">
                                            <td className="border border-black px-2 py-1.5 text-center">{index + 1}</td>
                                            <td className="border border-black px-3 py-1.5 font-medium">{item.user?.nama || '-'}</td>
                                            <td className="border border-black px-3 py-1.5">{item.alat?.nama_alat || '-'}</td>
                                            <td className="border border-black px-2 py-1.5 text-center">{formatDate(item.tanggal_pinjam)}</td>
                                            <td className="border border-black px-2 py-1.5 text-center">{formatDate(item.tanggal_kembali)}</td>
                                            <td className="border border-black px-2 py-1.5 text-center text-xs uppercase font-bold">
                                                {item.status === 'kembali' ? 'Selesai' :
                                                    item.status === 'disetujui' ? 'Dipinjam' : item.status.replace('_', ' ')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="border border-black px-4 py-8 text-center italic">
                                            -- Tidak ada data peminjaman ditemukan pada periode ini --
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* TOTAL RINGKASAN */}
                    <div className="mb-12 text-sm print:break-inside-avoid">
                        <p>Total Transaksi: <b>{data.length}</b></p>
                    </div>

                    {/* TANDA TANGAN */}
                    <div className="flex justify-end print:break-inside-avoid">
                        <div className="text-center w-64">
                            <p className="mb-1">Ponorogo, {formatDate(new Date())}</p>
                            <p className="font-medium mb-20">Petugas Inventaris,</p>
                            <p className="font-bold underline underline-offset-2">{petugas || 'Admin Petugas'}</p>
                            <p className="text-sm">NIP. ..............................</p>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 20mm 15mm 20mm 15mm;
                    }

                    /* FORCE RESET EVERYTHING FOR MULTI-PAGE FLOW */
                    html, body {
                        height: auto !important;
                        overflow: visible !important;
                        position: static !important;
                        background: white !important;
                    }

                    /* Hide everything else */
                    body > *:not(div:last-child) { display: none !important; }

                    /* Target the Portal content */
                    div[data-nextjs-scroll-focus-boundary] {
                         display: contents !important;
                    }

                    /* Ensure our container flows naturally */
                    #laporan-print-area {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    /* Standardize fonts */
                    * {
                        color: black !important;
                        font-family: 'Times New Roman', Times, serif !important;
                    }
                    
                    table { page-break-inside: auto; }
                    tr    { page-break-inside: avoid; page-break-after: auto }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    
                    .border-double { border-bottom-width: 4px !important; border-style: double !important; }
                }
            `}</style>
        </div>,
        document.body
    );
}
