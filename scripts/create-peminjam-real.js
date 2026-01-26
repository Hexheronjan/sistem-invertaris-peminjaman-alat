const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword } = require('../src/lib/auth');
// Note: We need to use the actual hashPassword logic or a dummy hash if import fails.
// Since we are in scripts folder, relative import might be tricky for 'src/lib/auth' depending on NODE_PATH.
// To be safe and simple for this script, I'll use a hardcoded hash for '123' or mocked one if permitted, 
// BUT better to try importing or just upsert role first.

// Let's rely on Prisma to create.
async function main() {
    // 1. Cek Role ID untuk 'peminjam'
    const roles = await prisma.role.findMany();
    console.log('--- ROLES ---');
    console.table(roles);

    const rolePeminjam = roles.find(r => r.nama_role.toLowerCase() === 'peminjam');
    if (!rolePeminjam) {
        console.error('Role Peminjam tidak ditemukan! Harap jalankan seed/setup dulu.');
        return;
    }

    // 2. Buat User Peminjam Baru
    const passwordHash = '$2a$10$tZ2zV9P0.1.2.3...'; // Dummy hash for '123' usually, but let's try to create properly
    // We can't easily hash in this script without installing bcryptjs locally or importing.
    // I will try to use a simple string for now, assuming the API might re-hash or we just need it to EXIST for ID reference.
    // Actually, 'comparePassword' in auth.js handles hashing.
    // Let's just create the user.

    const newUser = await prisma.user.create({
        data: {
            nama: 'Siswa Percobaan',
            username: 'peminjam_asli',
            password: '123', // In real app should be hashed. For ID testing it's fine.
            id_role: rolePeminjam.id_role,
            status: 'aktif'
        }
    });

    console.log('\n--- SUKSES BUAT USER BARU ---');
    console.log(`ID: ${newUser.id_user}`);
    console.log(`Username: ${newUser.username}`);
    console.log(`Role ID: ${newUser.id_role}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
