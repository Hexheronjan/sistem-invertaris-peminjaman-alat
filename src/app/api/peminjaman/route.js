import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id_user = searchParams.get('id_user');

    const whereClause = {};
    if (id_user) {
        whereClause.id_user = parseInt(id_user);
    }

    const loans = await prisma.peminjaman.findMany({
        where: whereClause,
        include: {
            user: { select: { nama: true } },
            alat: { select: { nama_alat: true } }
        },
        orderBy: {
            tanggal_pinjam: 'desc'
        }
    });

    return NextResponse.json(loans);
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { id_user, id_alat, tanggal_pinjam, tanggal_kembali } = body;

        // Validasi
        const alat = await prisma.alat.findUnique({ where: { id_alat: parseInt(id_alat) } });
        if (!alat || alat.stok < 1) {
            return NextResponse.json({ message: 'Stok alat habis atau tidak ditemukan' }, { status: 400 });
        }

        const peminjaman = await prisma.peminjaman.create({
            data: {
                id_user: parseInt(id_user),
                id_alat: parseInt(id_alat),
                tanggal_pinjam: new Date(tanggal_pinjam),
                tanggal_kembali: new Date(tanggal_kembali),
                status: 'pengajuan'
            }
        });

        const { logActivity } = await import('@/lib/logger');
        await logActivity(parseInt(id_user), `Mengajukan peminjaman alat ID: ${id_alat}`);

        return NextResponse.json(peminjaman, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
