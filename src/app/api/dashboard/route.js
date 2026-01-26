import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id_user = searchParams.get('id_user');

        // Statistik Umum (Untuk Admin/Petugas)
        const stats = {
            total_alat: await prisma.alat.count(),
            total_kategori: await prisma.kategori.count(),
            total_peminjaman: await prisma.peminjaman.count(),
            total_user: await prisma.user.count(),
            peminjaman_aktif: await prisma.peminjaman.count({
                where: { status: { in: ['pengajuan', 'disetujui'] } }
            }),
            active_loans: await prisma.peminjaman.count({
                where: { status: 'disetujui' }
            }),
            pending_requests: await prisma.peminjaman.count({
                where: { status: 'pengajuan' }
            }),
            total_denda: await prisma.pengembalian.aggregate({
                _sum: { denda: true }
            }).then(res => res._sum.denda || 0),
            recent_logs: await prisma.logAktivitas.findMany({
                take: 5,
                orderBy: { waktu: 'desc' },
                include: { user: { select: { username: true } } }
            }),
            pending_queue: await prisma.peminjaman.findMany({
                where: { status: 'pengajuan' },
                take: 5,
                orderBy: { tanggal_pinjam: 'desc' },
                include: {
                    user: { select: { nama: true } },
                    alat: { select: { nama_alat: true } }
                }
            })
        };

        // Statistik Personal (Jika ada id_user)
        if (id_user) {
            stats.personal = {
                total_pinjam: await prisma.peminjaman.count({ where: { id_user: parseInt(id_user) } }),
                sedang_dipinjam: await prisma.peminjaman.count({
                    where: {
                        id_user: parseInt(id_user),
                        status: { in: ['pengajuan', 'disetujui'] }
                    }
                })
            };
        }

        return NextResponse.json(stats);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
