import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { id_pinjam, tanggal_dikembalikan, denda_tambahan, deskripsi, kondisi_akhir } = body;

        console.log('DEBUG Pengembalian:', { id_pinjam, kondisi_akhir, body });

        const tglKembaliActual = new Date(tanggal_dikembalikan);

        // Ambil data peminjaman
        const pinjam = await prisma.peminjaman.findUnique({
            where: { id_pinjam: parseInt(id_pinjam) },
            include: { alat: true }
        });

        if (!pinjam) {
            return NextResponse.json({ message: 'Data peminjaman tidak ditemukan' }, { status: 404 });
        }

        if (pinjam.status === 'kembali') {
            return NextResponse.json({ message: 'Barang sudah dikembalikan' }, { status: 400 });
        }

        // Hitung keterlambatan
        const tglJadwalKembali = new Date(pinjam.tanggal_kembali);
        const diffTime = tglKembaliActual - tglJadwalKembali;

        const diffDaysRaw = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffDays = diffDaysRaw > 0 ? diffDaysRaw : 0;

        const dendaTerlambat = diffDays * 1000;
        const dendaTambahan = Number(denda_tambahan) || 0;
        const dendaTotal = dendaTerlambat + dendaTambahan;

        // Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update status peminjaman
            await tx.peminjaman.update({
                where: { id_pinjam: parseInt(id_pinjam) },
                data: { status: 'kembali' }
            });

            // 2. Insert pengembalian
            // Note: Trigger tambah_stok_fungsi() otomatis menambah stok saat INSERT pengembalian
            const pengembalian = await tx.pengembalian.create({
                data: {
                    id_pinjam: parseInt(id_pinjam),
                    tanggal_dikembalikan: tglKembaliActual,
                    denda: dendaTotal,
                }
            });

            // 3. Handle Update Stok (Manual Logic - Pengganti Trigger)

            if (kondisi_akhir === 'rusak') {
                // Barang Rusak: Tidak masuk stok tersedia, tapi masuk stok_rusak
                // Karena kita tidak menambah stok 'baik' (karena trigger sudah dihapus),
                // Kita hanya Perlu: Increment stok_rusak.
                // Stok 'baik' tetap berkurang (karena saat pinjam berkurang, dan saat kembali rusak tidak kita tambah).

                await tx.alat.update({
                    where: { id_alat: pinjam.id_alat },
                    data: {
                        stok_rusak: { increment: pinjam.jumlah }
                    }
                });

            } else if (kondisi_akhir === 'hilang') {
                // Barang Hilang: Stok hilang selamanya.
                // Tidak perlu update apa-apa ke tabel alat.
                // Stok 'baik' sudah berkurang saat pinjam, dan tidak kita kembalikan. Pas.

            } else {
                // Default: Kondisi 'baik' (atau null/undefined dianggap baik)
                // Kembalikan ke stok tersedia
                await tx.alat.update({
                    where: { id_alat: pinjam.id_alat },
                    data: {
                        stok: { increment: pinjam.jumlah }
                    }
                });
            }

            return pengembalian;
        });

        const { logActivity } = await import('@/lib/logger');

        const infoDenda = dendaTambahan > 0
            ? `(Denda Kerusakan: ${dendaTambahan}. Alasan: ${deskripsi})`
            : '';

        const infoKondisi = kondisi_akhir ? `[Kondisi: ${kondisi_akhir.toUpperCase()}]` : '';

        await logActivity(
            pinjam.id_user,
            `Mengembalikan alat ID: ${pinjam.id_alat}. ${infoKondisi} Total Denda: ${result.denda} ${infoDenda}`
        );

        return NextResponse.json({
            message: 'Pengembalian berhasil',
            data: result,
            denda: dendaTotal,
            terlambat: diffDays,
            denda_info: diffDays > 0 || dendaTotal > 0
                ? `Terlambat ${diffDays} hari. Denda Rp ${dendaTotal}`
                : 'Tepat waktu'
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
