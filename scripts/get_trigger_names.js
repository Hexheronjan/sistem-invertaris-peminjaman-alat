
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const triggers = await prisma.$queryRaw`
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'peminjaman';
    `;
    console.log('TRIGGERS ON PENGEMBALIAN:', triggers);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
