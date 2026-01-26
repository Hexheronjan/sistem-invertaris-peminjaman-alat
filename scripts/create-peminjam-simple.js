const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- ROLES ---');
    const roles = await prisma.role.findMany();
    console.table(roles);

    const roleMatches = roles.filter(r => r.nama_role.toLowerCase().includes('peminjam') || r.nama_role.toLowerCase().includes('member'));
    if (roleMatches.length === 0) {
        console.error('Role Peminjam tidak ditemukan. Pastikan sudah di-seed.');
        return;
    }
    const rolePeminjam = roleMatches[0];
    console.log(`Menggunakan Role ID: ${rolePeminjam.id_role} (${rolePeminjam.nama_role})`);

    // Create User
    // Use simple password '123' (In real app, hash this manually if needed, or update via Admin UI later)
    const newUser = await prisma.user.create({
        data: {
            nama: 'Siswa Peminjam Asli',
            username: 'peminjam_asli',
            password: '123',
            id_role: rolePeminjam.id_role,
            status: 'aktif'
        }
    });

    console.log('\n--- SKSES! USER PEMINJAM DIBUAT ---');
    console.log(`ID: ${newUser.id_user}`);
    console.log(`Username: ${newUser.username}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
