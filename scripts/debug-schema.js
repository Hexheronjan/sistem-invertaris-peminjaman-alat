const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
    try {
        console.log("Attempting to update alat ID 2 with foto field...");
        const updated = await prisma.alat.update({
            where: { id_alat: 2 },
            data: {
                foto: 'test.jpg'
            }
        });
        console.log("Success! Column 'foto' exists.");
    } catch (e) {
        console.error("FAILED. Detail Error:");
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchema();
