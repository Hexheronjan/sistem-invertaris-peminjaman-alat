import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { message: 'Username dan password wajib diisi' },
                { status: 400 }
            );
        }

        // Cari user berdasarkan username
        const user = await prisma.user.findUnique({
            where: { username },
            include: { role: true } // Ambil data role juga
        });

        if (!user) {
            return NextResponse.json(
                { message: 'User tidak ditemukan' },
                { status: 401 }
            );
        }

        // Cek password
        // Note: Jika di database masih plain text (data dummy awal), 
        // kita mungkin perlu handling khusus. Tapi idealnya di-hash.
        // Di sini kita asumsikan sudah di-hash, atau jika gagal compare,
        // kita cek equality biasa (fallback untuk development dengan data dummy)
        let isPasswordValid = await comparePassword(password, user.password);

        // Fallback: Jika database masih plain text (TIDAK AMAN, CUMA UTK DEV/MIGRASI AWAL)
        if (!isPasswordValid && password === user.password) {
            isPasswordValid = true;
        }

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Password salah' },
                { status: 401 }
            );
        }

        // Cek status aktif
        if (user.status !== 'aktif') {
            return NextResponse.json(
                { message: 'Akun anda tidak aktif' },
                { status: 403 }
            );
        }

        // Buat Token
        const payload = {
            id_user: user.id_user,
            username: user.username,
            role: user.role.nama_role,
            id_role: user.id_role
        };

        const token = await signToken(payload);

        // LOG AKTIVITAS
        try {
            const { logActivity } = await import('@/lib/logger');
            await logActivity(user.id_user, 'Login ke sistem');
        } catch (e) {
            console.error('Log error', e);
        }

        // Buat response dengan cookie
        const response = NextResponse.json(
            {
                message: 'Login berhasil',
                user: {
                    id_user: user.id_user, // FIXED: Consistent naming
                    nama: user.nama,
                    role: user.role.nama_role
                }
            },
            { status: 200 }
        );

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 hari
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
