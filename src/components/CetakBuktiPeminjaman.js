'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function CetakBuktiPeminjaman({ peminjaman, onClose }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent scrolling on background when modal is open
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
        // Delay slighty to ensure styles triggered
        setTimeout(() => {
            window.print();
        }, 100);
    };

    if (!mounted) return null;

    const noTransaksi = `#PM-${String(peminjaman.id_pinjam).padStart(6, '0')}`;

    // Gunakan Portal untuk merender di body, lepas dari layout Sidebar/Main
    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:block">

            {/* Modal Container (Screen View) */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto print:shadow-none print:max-w-none print:w-full print:max-h-none print:overflow-visible print:rounded-none">

                {/* Header Modal (Hidden in Print) */}
                <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Preview Cetak</h2>
                        <p className="text-slate-500 text-sm">Pastikan data sudah benar sebelum mencetak.</p>
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

                    {/* AREA STRUK - Diduplikasi stylingnya agar tampilan layar mirip hasil print */}
                    <div id="print-area" className="mx-auto bg-white text-slate-900">

                        {/* Border Container */}
                        <div className="border-[3px] border-slate-900 p-8 print:border-[3px] print:border-black print:p-8 h-full flex flex-col justify-between">

                            {/* Header Struk */}
                            <div className="text-center border-b-[3px] border-slate-900 pb-6 mb-8 print:border-black">
                                <h1 className="text-4xl font-extrabold tracking-tight uppercase mb-2 print:text-4xl">BUKTI PEMINJAMAN</h1>
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
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Jumlah</p>
                                        <p className="text-2xl font-bold text-slate-900 print:text-2xl">{peminjaman.jumlah} Unit</p>
                                    </div>
                                </div>

                                {/* Row 3: Tanggal (Highlight) */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 grid grid-cols-2 gap-8 print:bg-slate-50 print:border-slate-300">
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Pinjam</p>
                                        <p className="text-xl font-bold text-slate-900 print:text-xl">{formatDate(peminjaman.tanggal_pinjam)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Kembali</p>
                                        <p className="text-xl font-bold text-slate-900 print:text-xl">{formatDate(peminjaman.tanggal_kembali)}</p>
                                    </div>
                                </div>

                                {/* Row 4: Peminjam & Status */}
                                <div className="grid grid-cols-2 gap-8 pt-4">
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Peminjam</p>
                                        <div>
                                            <p className="text-xl font-bold text-slate-900 print:text-xl">{peminjaman.user?.nama}</p>
                                            <p className="text-sm text-slate-500">{peminjaman.user?.username}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Status Saat Ini</p>
                                        <span className={`inline-block px-4 py-2 rounded-lg text-sm font-black uppercase border-2 ${peminjaman.status === 'kembali' ? 'border-blue-600 text-blue-700 bg-blue-50' :
                                                'border-slate-600 text-slate-700 bg-slate-50'
                                            }`}>
                                            {peminjaman.status === 'disetujui' ? 'SEDANG DIPINJAM' :
                                                peminjaman.status === 'kembali' ? 'SUDAH DIKEMBALIKAN' :
                                                    peminjaman.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Struk */}
                            <div className="mt-12 pt-6 border-t-[3px] border-slate-200 text-center print:mt-16 print:border-slate-300">
                                <p className="text-base font-bold text-slate-800 mb-2">TERIMA KASIH</p>
                                <p className="text-sm text-slate-500 max-w-md mx-auto">
                                    Harap simpan bukti ini sebagai referensi pengambilan dan pengembalian alat.
                                    Segala kerusakan atau kehilangan menjadi tanggung jawab peminjam.
                                </p>
                                <div className="mt-6 font-mono text-xs text-slate-300 uppercase tracking-widest">
                                    {/* Barcode simulation */}
                                    ||| | ||| || ||| | || ||| || | ||| || ||
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Footer Modal (Action Buttons) - Hidden in Print */}
                <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl print:hidden">
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

            {/* Global Print Styles (Portal Scoped) */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }

                    /* Hide everything except our portal root */
                    body > *:not(div:last-child) { 
                        /* Note: This selector assumes portal is appended last. 
                           Safer to just hide known roots if structure is complex, 
                           but generally 'visibility: hidden' on Body then 'visible' on content is safer. */
                        display: none !important;
                    }

                    body {
                        background: white !important;
                        margin: 0 !important;
                        overflow: visible !important;
                    }

                    /* Target id print-area inside the portal */
                    #print-area {
                        display: block !important;
                        position: relative !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important; /* Full A4 width */
                        min-height: 297mm !important; /* Full A4 height */
                        padding: 15mm !important; /* Professional margins */
                        margin: 0 !important;
                        background: white !important;
                        box-sizing: border-box !important;
                        overflow: visible !important;
                    }

                    /* Colors fix */
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