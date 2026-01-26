import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const { status, tanggal_pinjam, tanggal_kembali, jumlah } = await request.json(); // status, dates, jumlah

        // Siapkan data update
        const dataToUpdate = {};
        if (status) dataToUpdate.status = status;
        if (tanggal_pinjam) dataToUpdate.tanggal_pinjam = new Date(tanggal_pinjam);
        if (tanggal_kembali) dataToUpdate.tanggal_kembali = new Date(tanggal_kembali);
        if (jumlah) dataToUpdate.jumlah = parseInt(jumlah);

        const updated = await prisma.$transaction(async (tx) => {
            // 1. Cek Peminjaman Lama
            const currentPinjam = await tx.peminjaman.findUnique({
                where: { id_pinjam: id },
                include: { alat: true }
            });

            if (!currentPinjam) throw new Error("Peminjaman tidak ditemukan");

            // VALIDASI UPDATE JUMLAH (Hanya jika status masih pengajuan)
            if (jumlah && currentPinjam.status === 'pengajuan') {
                const newJumlah = parseInt(jumlah);
                if (newJumlah > currentPinjam.alat.stok) {
                    throw new Error(`Stok tidak cukup! Tersedia: ${currentPinjam.alat.stok} unit.`);
                }
            }

            // 2. Update Data Peminjaman
            // 3. LOGIKA STOK MANUAL (Pengganti Trigger)

            // A. PENGURANGAN STOK SAAT DISETUJUI
            // Jika status berubah menjadi 'disetujui' (dan sebelumnya bukan disetujui_
            if (status === 'disetujui' && currentPinjam.status !== 'disetujui') {
                // Cek stok lagi untuk memastikan aman dalam race condition (meski sudah dicek di UI)
                const freshAlat = await tx.alat.findUnique({ where: { id_alat: currentPinjam.id_alat } });
                if (!freshAlat || freshAlat.stok < currentPinjam.jumlah) {
                    throw new Error(`Stok tidak cukup saat menyetujui! Tersedia: ${freshAlat?.stok || 0}`);
                }

                await tx.alat.update({
                    where: { id_alat: currentPinjam.id_alat },
                    data: { stok: { decrement: currentPinjam.jumlah } }
                });
            }

            // Jika status berubah dari 'disetujui' ke status lain (misalnya ditolak), kembalikan stok
            if (currentPinjam.status === 'disetujui' && status && status !== 'disetujui' && status !== 'kembali') {
                await tx.alat.update({
                    where: { id_alat: currentPinjam.id_alat },
                    data: { stok: { increment: currentPinjam.jumlah } } // Kembalikan stok yang sudah dikurangi
                });
            }



            // 4. Update Data Peminjaman
            const updatedPinjam = await tx.peminjaman.update({
                where: { id_pinjam: id },
                data: dataToUpdate
            });

            console.log('Pinjam updated');

            return updatedPinjam;
        });

        // Log (Ambil ID User pemilik peminjaman untuk referensi, atau ID petugas jika ada context)
        const { logActivity } = await import('@/lib/logger');
        // Kita log ke user peminjam bahwa statusnya berubah
        const statusLog = status || updated.status || 'diupdate';
        await logActivity(updated.id_user, `Status peminjaman diubah menjadi: ${statusLog}`);

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        // Cek peminjaman sebelum delete untuk mengembalikan stok jika sudah disetujui
        const pinjam = await prisma.peminjaman.findUnique({
            where: { id_pinjam: id },
            include: { alat: true }
        });

        if (!pinjam) {
            return NextResponse.json({ message: 'Peminjaman tidak ditemukan' }, { status: 404 });
        }

        // Transaction untuk memastikan data konsisten
        await prisma.$transaction(async (tx) => {
            // Jika status sudah disetujui, kembalikan stok terlebih dahulu
            if (pinjam.status === 'disetujui') {
                await tx.alat.update({
                    where: { id_alat: pinjam.id_alat },
                    data: { stok: { increment: pinjam.jumlah } }
                });
            }

            // Hapus peminjaman
            await tx.peminjaman.delete({ where: { id_pinjam: id } });
        });

        return NextResponse.json({ message: 'Data dihapus' });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
