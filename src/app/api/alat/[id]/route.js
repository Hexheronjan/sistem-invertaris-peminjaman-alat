import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, props) {
    // Next.js 15: props.params is a Promise
    const params = await props.params;

    try {
        const id = parseInt(params.id);

        console.log(`[API PUT] Updating alat ID: ${id}`);
        const body = await request.json();
        console.log(`[API PUT] Body:`, body);

        // Safe Parsing
        const id_kategori = parseInt(body.id_kategori);
        const stok = parseInt(body.stok);

        if (isNaN(id) || isNaN(id_kategori) || isNaN(stok)) {
            console.error("[API PUT] Validation Failed: NaN detected");
            return NextResponse.json({ message: 'Data tidak valid (ID/Stok/Kategori harus angka)' }, { status: 400 });
        }

        const updateData = {
            kode_alat: body.kode_alat || null,
            nama_alat: body.nama_alat,
            stok: stok,
            kondisi: body.kondisi,
            foto: body.foto || null,
            kategori: {
                connect: { id_kategori: id_kategori }
            }
        };

        const updatedAlat = await prisma.alat.update({
            where: { id_alat: id },
            data: updateData
        });

        console.log("[API PUT] Success");
        return NextResponse.json({ message: 'Alat berhasil diupdate', data: updatedAlat });
    } catch (error) {
        console.error("[API PUT] Error:", error);
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
