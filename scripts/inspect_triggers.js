
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- INSPECTING TRIGGERS ---');

    const triggers = await prisma.$queryRaw`
        SELECT trigger_name, event_object_table, event_manipulation, action_statement
        FROM information_schema.triggers
        WHERE event_object_table IN ('peminjaman', 'pengembalian')
    `;
    console.log(JSON.stringify(triggers, null, 2));

    const func = await prisma.$queryRaw`
         SELECT pg_get_functiondef(p.oid) as def
         FROM pg_proc p WHERE p.proname = 'tambah_stok_fungsi';
    `;
    if (func.length > 0) {
        console.log('\nFUNCTION tambah_stok_fungsi:\n', func[0].def);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
