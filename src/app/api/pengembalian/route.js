import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const body = await request.json();
        const { id_pinjam, tanggal_dikembalikan } = body;

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

        // Hitung Denda (Replikasi logic function SQL untuk response API)
        // 1000 per hari terlambat
        const tglJadwalKembali = new Date(pinjam.tanggal_kembali);
        const diffTime = tglKembaliActual - tglJadwalKembali;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let denda = 0;
        if (diffDays > 0) {
            denda = diffDays * 1000;
        }

        // Gunakan Transaction untuk konsistensi
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update status peminjaman
            await tx.peminjaman.update({
                where: { id_pinjam: parseInt(id_pinjam) },
                data: { status: 'kembali' }
            });

            // 2. Insert Pengembalian
            // Trigger 'tambah_stok' di database akan jalan setelah insert ini
            const pengembalian = await tx.pengembalian.create({
                data: {
                    id_pinjam: parseInt(id_pinjam),
                    tanggal_dikembalikan: tglKembaliActual,
                    denda: denda
                }
            });

            return pengembalian;
        });

        const { logActivity } = await import('@/lib/logger');
        // Log ke peminjam
        await logActivity(pinjam.id_user, `Mengembalikan alat ID: ${pinjam.id_alat}. Denda: ${result.denda}`);

        return NextResponse.json({
            message: 'Pengembalian berhasil',
            data: result,
            denda_info: denda > 0 ? `Terlambat ${diffDays} hari. Denda Rp ${denda}` : 'Tepat waktu'
        });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
