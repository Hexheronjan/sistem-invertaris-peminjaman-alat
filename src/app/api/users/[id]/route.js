import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function PUT(request, { params }) {
    try {
        const { id: idParam } = await params;
        const id = Number(idParam);
        const body = await request.json();
        const { nama, username, password, id_role, status } = body;

        const dataToUpdate = {};
        if (nama) dataToUpdate.nama = nama;
        if (username) dataToUpdate.username = username;
        if (id_role) dataToUpdate.id_role = Number(id_role);
        if (status) dataToUpdate.status = status;
        if (password) {
            dataToUpdate.password = await hashPassword(password);
        }

        const updatedUser = await prisma.user.update({
            where: { id_user: id },
            data: dataToUpdate
        });

        const { password: _, ...safeUser } = updatedUser;

        return NextResponse.json({ message: 'User berhasil diperbarui', data: safeUser }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Gagal memperbarui user', error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id: idParam } = await params;
        const id = Number(idParam);

        await prisma.user.delete({
            where: { id_user: id }
        });

        return NextResponse.json({ message: 'User berhasil dihapus' }, { status: 200 });

    } catch (error) {
        if (error.code === 'P2003') { // Foreign key constraint
            return NextResponse.json({ message: 'User tidak bisa dihapus karena memiliki data terkait (peminjaman/log)' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Gagal menghapus user', error: error.message }, { status: 500 });
    }
}
