import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const kategori = searchParams.get('kategori');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const whereClause = {
        nama_alat: {
            contains: search,
            mode: 'insensitive' // Requires PostgreSQL extension or specific collation, default is case sensitive in some configs, but Prisma usually handles this.
        }
    };

    if (kategori) {
        whereClause.id_kategori = parseInt(kategori);
    }

    try {
        const [data, total] = await prisma.$transaction([
            prisma.alat.findMany({
                where: whereClause,
                include: { kategori: true },
                skip,
                take: limit,
                orderBy: { nama_alat: 'asc' }
            }),
            prisma.alat.count({ where: whereClause })
        ]);

        return NextResponse.json({
            data,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { nama_alat, id_kategori, stok, kondisi } = body;

        const alat = await prisma.alat.create({
            data: {
                nama_alat,
                id_kategori: Number(id_kategori),
                stok: Number(stok),
                kondisi: kondisi || 'baik'
            }
        });

        return NextResponse.json(alat, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
