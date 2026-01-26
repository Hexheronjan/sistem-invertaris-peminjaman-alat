
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { action, jumlah = 1 } = body;

        // Validasi input
        if (!['rusak', 'perbaiki'].includes(action)) {
            return NextResponse.json({ message: 'Action tidak valid' }, { status: 400 });
        }

        const jumlahInt = parseInt(jumlah);
        if (isNaN(jumlahInt) || jumlahInt < 1) {
            return NextResponse.json({ message: 'Jumlah harus lebih besar dari 0' }, { status: 400 });
        }

        // Ambil data alat saat ini
        const alat = await prisma.alat.findUnique({
            where: { id_alat: parseInt(id) }
        });

        if (!alat) {
            return NextResponse.json({ message: 'Alat tidak ditemukan' }, { status: 404 });
        }

        let updateData = {};

        if (action === 'rusak') {
            if (alat.stok < jumlahInt) {
                return NextResponse.json({ message: 'Stok tidak mencukupi' }, { status: 400 });
            }
            updateData = {
                stok: { decrement: jumlahInt },
                stok_rusak: { increment: jumlahInt }
            };
        } else if (action === 'perbaiki') {
            if (alat.stok_rusak < jumlahInt) {
                return NextResponse.json({ message: 'Stok rusak tidak mencukupi' }, { status: 400 });
            }
            updateData = {
                stok: { increment: jumlahInt },
                stok_rusak: { decrement: jumlahInt }
            };
        }

        // Update database
        const updatedAlat = await prisma.alat.update({
            where: { id_alat: parseInt(id) },
            data: updateData
        });

        return NextResponse.json(updatedAlat);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
