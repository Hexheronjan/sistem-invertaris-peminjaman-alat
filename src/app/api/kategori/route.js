import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const kategori = await prisma.kategori.findMany();
    return NextResponse.json(kategori);
}

export async function POST(request) {
    try {
        const { nama_kategori } = await request.json();
        const kategori = await prisma.kategori.create({
            data: { nama_kategori }
        });
        return NextResponse.json(kategori, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
