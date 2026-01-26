
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DROPPING TRIGGERS ---');

    try {
        await prisma.$executeRaw`DROP TRIGGER IF EXISTS tambah_stok ON pengembalian;`;
        console.log('Dropped trigger tambah_stok on pengembalian');
    } catch (e) {
        console.error('Failed to drop tambah_stok:', e.message);
    }

    try {
        await prisma.$executeRaw`DROP TRIGGER IF EXISTS kurangi_stok ON peminjaman;`;
        console.log('Dropped trigger kurangi_stok on peminjaman');
    } catch (e) {
        console.error('Failed to drop kurangi_stok:', e.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
