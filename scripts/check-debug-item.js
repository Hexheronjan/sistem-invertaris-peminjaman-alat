
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const item = await prisma.alat.findFirst({ where: { kode_alat: 'DEBUG-BOR-001' } });
    console.log('DEBUG ITEM:', item);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
