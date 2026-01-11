import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const body = await request.json();

        // Validasi
        // id_kategori harus int, stok harus int
        const updateData = {
            nama_alat: body.nama_alat,
            id_kategori: parseInt(body.id_kategori),
            stok: parseInt(body.stok),
            kondisi: body.kondisi,
            deskripsi: body.deskripsi
        };

        const updatedAlat = await prisma.alat.update({
            where: { id_alat: id },
            data: updateData
        });

        // Log
        const { logActivity } = await import('@/lib/logger');
        // Note: we need context user ID here. For now we assume this is called by admin/petugas.
        // In real app, we get user from headers set by middleware.
        // const userId = request.headers.get('x-user-id');
        // if(userId) logActivity(userId, `Mengubah alat: ${updatedAlat.nama_alat}`);

        return NextResponse.json({ message: 'Alat berhasil diupdate', data: updatedAlat });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal update alat', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);

        const deleted = await prisma.alat.delete({
            where: { id_alat: id }
        });

        return NextResponse.json({ message: 'Alat berhasil dihapus' });
    } catch (error) {
        // Cek foreign key constraint (e.g. masih ada peminjaman)
        if (error.code === 'P2003') {
            return NextResponse.json({ message: 'Gagal hapus: Alat sedang digunakan/ada riwayat peminjaman.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Gagal hapus alat', error: error.message }, { status: 500 });
    }
}
