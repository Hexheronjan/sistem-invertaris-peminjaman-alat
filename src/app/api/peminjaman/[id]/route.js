import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        const { status } = await request.json(); // 'disetujui', 'ditolak', 'kembali'

        // Update status
        // Logic pengurangan stok ada di Database Trigger (sesuai requirement user)
        // Saat status berubah jadi 'disetujui', trigger 'kurangi_stok' aktif.

        const updated = await prisma.peminjaman.update({
            where: { id_pinjam: id },
            data: { status }
        });

        // Log (Ambil ID User pemilik peminjaman untuk referensi, atau ID petugas jika ada context)
        const { logActivity } = await import('@/lib/logger');
        // Kita log ke user peminjam bahwa statusnya berubah
        await logActivity(updated.id_user, `Status peminjaman diubah menjadi: ${status}`);

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id: idParam } = await params;
        const id = parseInt(idParam);
        await prisma.peminjaman.delete({ where: { id_pinjam: id } });
        return NextResponse.json({ message: 'Data dihapus' });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
