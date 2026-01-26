const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DAFTAR USER ---');
    const users = await prisma.user.findMany();
    console.table(users.map(u => ({ id: u.id_user, username: u.username, role: u.id_role })));

    console.log('\n--- DAFTAR ALAT ---');
    const alats = await prisma.alat.findMany();
    console.table(alats.map(a => ({ id: a.id_alat, nama: a.nama_alat, stok: a.stok })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
