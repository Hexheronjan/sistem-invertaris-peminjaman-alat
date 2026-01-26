import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.logAktivitas.findMany({
                skip,
                take: limit,
                include: {
                    user: {
                        select: { nama: true, username: true, role: true }
                    }
                },
                orderBy: {
                    waktu: 'desc'
                }
            }),
            prisma.logAktivitas.count()
        ]);

        return NextResponse.json({
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal ambil log', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const action = searchParams.get('action');

        if (action === 'clean_old') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const result = await prisma.logAktivitas.deleteMany({
                where: {
                    waktu: {
                        lt: sevenDaysAgo
                    }
                }
            });
            return NextResponse.json({ message: `Berhasil hapus ${result.count} log lama.` });
        }

        if (id) {
            await prisma.logAktivitas.delete({
                where: { id_log: parseInt(id) } // id_log is Int
            });
            return NextResponse.json({ message: 'Log berhasil dihapus' });
        }

        return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal hapus log', error: error.message }, { status: 500 });
    }
}
