import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Paksa agar tidak dicache browser

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id_user = searchParams.get('id_user');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const whereClause = {};
        if (id_user) {
            whereClause.id_user = parseInt(id_user);
        }

        const [loans, total] = await Promise.all([
            prisma.peminjaman.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    user: { select: { nama: true } },
                    alat: { select: { nama_alat: true } },
                    pengembalian: {
                        select: {
                            denda: true,
                            tanggal_dikembalikan: true
                        },
                        orderBy: {
                            tanggal_dikembalikan: 'desc'
                        },
                        take: 1
                    }
                },
                orderBy: {
                    tanggal_pinjam: 'desc'
                }
            }),
            prisma.peminjaman.count({ where: whereClause })
        ]);

        return NextResponse.json({
            data: loans,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching loans:', error);
        return NextResponse.json({ message: error.message || 'Gagal mengambil data peminjaman' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { id_user, id_alat, tanggal_pinjam, tanggal_kembali, jumlah } = body;

        // Validasi
        const alat = await prisma.alat.findUnique({ where: { id_alat: parseInt(id_alat) } });
        if (!alat || alat.stok < (jumlah || 1)) {
            return NextResponse.json({ message: 'Stok alat tidak mencukupi' }, { status: 400 });
        }

        const peminjaman = await prisma.peminjaman.create({
            data: {
                id_user: parseInt(id_user),
                id_alat: parseInt(id_alat),
                tanggal_pinjam: new Date(tanggal_pinjam),
                tanggal_kembali: new Date(tanggal_kembali),
                jumlah: parseInt(jumlah) || 1,
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
