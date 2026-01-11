import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function GET(request) {
    try {
        // Di sini seharusnya ada pengecekan Auth/Role (via Middleware atau header check)
        // Untuk simplifikasi backend logic, kita return data dulu.

        const users = await prisma.user.findMany({
            include: {
                role: true
            },
            orderBy: {
                id_user: 'asc'
            }
        });

        // Hapus password dari response
        const safeUsers = users.map(user => {
            const { password, ...rest } = user;
            return rest;
        });

        return NextResponse.json(safeUsers, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal mengambil data user', error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { nama, username, password, id_role, status } = body;

        // Validasi dasar
        if (!nama || !username || !password || !id_role) {
            return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
        }

        // Cek duplikasi username
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return NextResponse.json({ message: 'Username sudah digunakan' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                nama,
                username,
                password: hashedPassword,
                id_role: Number(id_role),
                status: status || 'aktif'
            }
        });

        const { password: _, ...userWithoutPassword } = newUser;

        // Log Aktivitas
        // const { logActivity } = await import('@/lib/logger');
        // await logActivity(newUser.id_user, `User terdaftar: ${username}`);

        return NextResponse.json({ message: 'User berhasil dibuat', data: userWithoutPassword }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: 'Gagal membuat user', error: error.message }, { status: 500 });
    }
}
