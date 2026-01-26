'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function CetakBuktiPengembalian({ peminjaman, pengembalian, onClose }) {
    const [mounted, setMounted] = useState(false);
    const [isManualPaid, setIsManualPaid] = useState(false); // Toggle untuk Demo Lunas

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const formatDate = (date) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' });
    };

    const formatDateTime = (date) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handlePrint = () => {
        setTimeout(() => {
            window.print();
        }, 100);
    };

    if (!mounted) return null;

    const noTransaksi = `#LM-${String(peminjaman.id_pinjam).padStart(6, '0')}`;
    const denda = pengembalian?.denda || 0;

    // Logic: Jika manual paid aktif, paksa status jadi LUNAS. Jika tidak, ikut logika asli.
    const isLunas = denda === 0 || isManualPaid;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:block">

            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto print:shadow-none print:max-w-none print:w-full print:max-h-none print:overflow-visible print:rounded-none">

                {/* Header Modal (Hidden in Print) */}
                <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Preview Pengembalian</h2>
                        <p className="text-slate-500 text-sm">Cek data sebelum mencetak struk.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-8 print:p-0">

                    {/* AREA STRUK */}
                    <div id="print-area" className="mx-auto bg-white text-slate-900">
                        {/* Border Container */}
                        <div className="border-[3px] border-slate-900 p-8 print:border-[3px] print:border-black print:p-8 h-full flex flex-col justify-between relative">

                            {/* STAMP LUNAS / BELUM LUNAS */}
                            <div className="absolute top-8 right-8 transform rotate-12 opacity-90 pointer-events-none print:opacity-100">
                                <div className={`px-6 py-2 rounded-lg border-[3px] shadow-sm text-2xl font-black tracking-widest uppercase ${isLunas ? 'border-green-600 text-green-700 bg-green-50' : 'border-red-600 text-red-700 bg-red-50'}`}>
                                    {isLunas ? 'LUNAS' : 'BELUM LUNAS'}
                                </div>
                            </div>

                            {/* Header Struk */}
                            <div className="text-center border-b-[3px] border-slate-900 pb-6 mb-8 print:border-black">
                                <h1 className="text-4xl font-extrabold tracking-tight uppercase mb-2 print:text-4xl">BUKTI PENGEMBALIAN</h1>
                                <p className="text-lg font-medium text-slate-600 uppercase tracking-widest print:text-lg print:text-slate-600">Sistem Inventaris Alat</p>
                            </div>

                            {/* Timestamp */}
                            <div className="flex justify-between items-end mb-8 text-sm font-medium text-slate-500 print:text-slate-600">
                                <p>Dicetak otomatis oleh sistem</p>
                                <p>{formatDateTime(new Date())}</p>
                            </div>

                            {/* Main Info */}
                            <div className="flex-grow space-y-8">
                                {/* Row 1: Transaksi */}
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Transaksi</p>
                                    <p className="text-3xl font-black text-slate-900 print:text-3xl">{noTransaksi}</p>
                                </div>

                                {/* Row 2: Barang & Jumlah */}
                                <div className="grid grid-cols-3 gap-8">
                                    <div className="col-span-2">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Barang / Alat</p>
                                        <p className="text-2xl font-bold text-slate-900 print:text-2xl">{peminjaman.alat?.nama_alat || '-'}</p>
                                        <p className="text-sm text-slate-500 font-mono mt-1">{peminjaman.alat?.kode_alat}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Denda Kerusakan</p>
                                        <p className={`text-2xl font-bold print:text-2xl ${denda > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                            Rp {denda.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>

                                {/* Row 3: Detail Tanggal */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 grid grid-cols-2 gap-8 print:bg-slate-50 print:border-slate-300">
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Pinjam</p>
                                        <p className="text-xl font-bold text-slate-900 print:text-xl">{formatDate(peminjaman.tanggal_pinjam)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Dikembalikan</p>
                                        <p className="text-xl font-bold text-slate-900 print:text-xl">{formatDate(pengembalian?.tanggal_dikembalikan)}</p>
                                    </div>
                                </div>

                                {/* Row 4: Peminjam & Status Final */}
                                <div className="grid grid-cols-2 gap-8 pt-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Peminjam</p>
                                        <div>
                                            <p className="text-xl font-bold text-slate-900 print:text-xl">{peminjaman.user?.nama}</p>
                                            <p className="text-sm text-slate-500">{peminjaman.user?.username}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Status Pembayaran</p>
                                        <span className={`inline-block px-4 py-2 rounded-lg text-sm font-black uppercase border-2 ${isLunas ? 'border-green-600 text-green-700 bg-green-50' :
                                                'border-red-600 text-red-700 bg-red-50'
                                            }`}>
                                            {isLunas ? 'LUNAS (SELESAI)' : 'BELUM LUNAS'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Struk */}
                            <div className="mt-12 pt-6 border-t-[3px] border-slate-200 text-center print:mt-16 print:border-slate-300">
                                <p className="text-base font-bold text-slate-800 mb-2">TERIMA KASIH</p>
                                <p className="text-sm text-slate-500 max-w-md mx-auto">
                                    Barang telah dikembalikan dan diverifikasi oleh petugas.
                                    {isLunas ? ' Segala kewajiban administrasi telah diselesaikan.' : ' Harap segera menyelesaikan pembayaran denda.'}
                                </p>
                                <div className="mt-6 font-mono text-xs text-slate-300 uppercase tracking-widest">
                                    {/* Barcode simulation */}
                                    ||| | ||| || ||| | || ||| || | ||| || ||
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer Modal (Actions) - Hidden in Print */}
                <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center rounded-b-2xl print:hidden">

                    {/* DEMO MODE TOGGLE */}
                    {denda > 0 && (
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    value=""
                                    className="sr-only peer"
                                    checked={isManualPaid}
                                    onChange={(e) => setIsManualPaid(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                <span className="ml-3 text-sm font-medium text-slate-700">
                                    Tandai Lunas <span className="text-xs text-slate-400"></span>
                                </span>
                            </label>
                        </div>
                    )}

                    <div className="flex gap-3 ml-auto">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            Tutup
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-8 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Cetak Bukti PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Print Styles (Portal Scoped) */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }

                    body > *:not(div:last-child) { 
                        display: none !important;
                    }

                    body {
                        background: white !important;
                        margin: 0 !important;
                        overflow: visible !important;
                    }

                    #print-area {
                        display: block !important;
                        position: relative !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        padding: 15mm !important;
                        margin: 0 !important;
                        background: white !important;
                        box-sizing: border-box !important;
                        overflow: visible !important;
                    }

                    #print-area * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>,
        document.body
    );
}