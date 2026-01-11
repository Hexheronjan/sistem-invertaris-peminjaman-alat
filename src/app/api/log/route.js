import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const logs = await prisma.logAktivitas.findMany({
            include: {
                user: {
                    select: { nama: true, username: true, role: true }
                }
            },
            orderBy: {
                waktu: 'desc'
            }
        });

        return NextResponse.json({ data: logs });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal ambil log', error: error.message }, { status: 500 });
    }
}
