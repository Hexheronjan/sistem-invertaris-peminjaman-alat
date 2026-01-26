
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const triggers = await prisma.$queryRaw`
    SELECT event_object_table, trigger_name, action_timing, event_manipulation 
    FROM information_schema.triggers 
    WHERE event_object_table IN ('peminjaman', 'pengembalian', 'alat');
  `;
    console.log("Found " + triggers.length + " triggers:");
    triggers.forEach(t => {
        console.log(`${t.trigger_name} on ${t.event_object_table} (${t.event_manipulation})`);
    });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
