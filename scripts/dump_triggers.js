
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DUMPING TRIGGERS & FUNCTIONS ---');

    // Get Triggers
    const triggers = await prisma.$queryRaw`
        SELECT 
            event_object_table, 
            trigger_name, 
            action_statement,
            action_orientation,
            action_timing
        FROM information_schema.triggers 
        WHERE event_object_table IN ('peminjaman', 'pengembalian', 'alat');
    `;
    console.log('\nTRIGGERS:', JSON.stringify(triggers, null, 2));

    // Get Functions (to see what the trigger call)
    const functions = await prisma.$queryRaw`
        SELECT 
            p.proname AS function_name, 
            pg_get_functiondef(p.oid) AS definition 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND p.proname LIKE '%stok%';
    `;

    console.log('\nFUNCTIONS:');
    functions.forEach(f => {
        console.log(`\n=== ${f.function_name} ===\n${f.definition}\n`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
