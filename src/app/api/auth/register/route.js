import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { nama, username, password } = body;

        // 1. Validasi Input
        if (!nama || !username || !password) {
            return NextResponse.json(
                { message: 'Semua field wajib diisi' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: 'Password minimal 6 karakter' },
                { status: 400 }
            );
        }

        // 2. Cek Username Kembar
        const existingUser = await prisma.user.findUnique({
            where: { username: username }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Username sudah dipakai' },
                { status: 400 }
            );
        }

        // 3. Hash Password
        const hashedPassword = await hashPassword(password);

        // 4. Buat User Baru (Default Role: Peminjam / ID 3)
        // Pastikan ID Role 3 (Peminjam) sudah ada di database (sudah kita seed)
        const newUser = await prisma.user.create({
            data: {
                nama,
                username,
                password: hashedPassword,
                id_role: 3, // Hardcoded ID for Peminjam based on our seed
                status: 'aktif'
            }
        });

        // 5. Return Success
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({
            message: 'Registrasi berhasil! Silakan login.',
            user: userWithoutPassword
        }, { status: 201 });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
