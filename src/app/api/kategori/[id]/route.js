import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Update Kategori
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { nama_kategori } = await request.json();

        const updated = await prisma.kategori.update({
            where: { id_kategori: Number(id) },
            data: { nama_kategori },
        });

        return NextResponse.json({ message: 'Kategori updated', data: updated });
    } catch (error) {
        return NextResponse.json(
            { message: 'Gagal update kategori', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE: Hapus Kategori
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        await prisma.kategori.delete({
            where: { id_kategori: Number(id) },
        });

        return NextResponse.json({ message: 'Kategori deleted' });
    } catch (error) {
        // Check for foreign key constraint (if category is used by alat)
        if (error.code === 'P2003') {
            return NextResponse.json(
                { message: 'Gagal hapus: Kategori ini sedang digunakan oleh Alat.' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: 'Gagal hapus kategori', error: error.message },
            { status: 500 }
        );
    }
}
