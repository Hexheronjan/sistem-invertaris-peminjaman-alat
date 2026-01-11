import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request) {
    // Ambil token dari cookies
    const token = request.cookies.get('token')?.value;

    // Path yang butuh proteksi
    const path = request.nextUrl.pathname;

    // 1. Proteksi Umum (Harus Login)
    // Berlaku untuk semua method POST/PUT/DELETE di /api/ (kecuali auth)
    if (path.startsWith('/api/') && !path.startsWith('/api/auth') && request.method !== 'GET') {
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized: Harap login terlebih dahulu' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ message: 'Unauthorized: Token tidak valid' }, { status: 401 });
        }

        // 2. Proteksi Khusus Role (Privilege Check)

        // Hanya Admin yang boleh kelola User (POST/PUT/DELETE)
        if (path.startsWith('/api/users')) {
            if (payload.role !== 'admin') {
                return NextResponse.json({ message: 'Forbidden: Hanya Admin yang boleh akses' }, { status: 403 });
            }
        }

        // Hanya Admin yang boleh kelola Alat & Kategori (Sesuai Tabel Fitur: CRUD Alat/Kategori = Admin Only)
        if ((path.startsWith('/api/alat') || path.startsWith('/api/kategori')) && request.method !== 'GET') {
            if (payload.role !== 'admin') {
                return NextResponse.json({ message: 'Forbidden: Hanya Admin yang boleh mengelola data master' }, { status: 403 });
            }
        }

        // Hanya Admin/Petugas yang boleh Approve Peminjaman (PUT) dan Kelola Pengembalian
        // Note: Tabel bilang Peminjam 'Mengembalikan alat', tapi biasanya sistem butuh verifikasi (denda).
        // Namun API /pengembalian di sini logic-nya finalisasi. 
        // Kita set: Semua User boleh akses /pengembalian (karena Peminjam dicentang di tabel), 
        // atau perketat jika perlu. Default: Login required (sudah tercover di atas).
        // Peminjam boleh POST (request), tapi tidak boleh PUT (approve)
        if (path.startsWith('/api/peminjaman') && request.method === 'PUT') {
            if (payload.role !== 'admin' && payload.role !== 'petugas') {
                return NextResponse.json({ message: 'Forbidden: Hanya Petugas yang boleh verifikasi' }, { status: 403 });
            }
        }

        // Menyimpan payload user ke header agar bisa diakses di route (opsional, tapi good practice)
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.id_user);
        requestHeaders.set('x-user-role', payload.role);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
