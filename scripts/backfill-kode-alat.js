const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfill() {
    try {
        // 1. Ambil semua alat yang kode_alat-nya masih NULL
        const tools = await prisma.alat.findMany({
            where: { kode_alat: null }
        });

        console.log(`Ditemukan ${tools.length} alat tanpa kode.`);

        for (const tool of tools) {
            // Generate Kode: BRG-[Random]-[ID]
            const newCode = `BRG-${Math.floor(1000 + Math.random() * 9000)}-${tool.id_alat}`;

            await prisma.alat.update({
                where: { id_alat: tool.id_alat },
                data: { kode_alat: newCode }
            });

            console.log(`Updated ${tool.nama_alat} -> ${newCode}`);
        }

        console.log('Selesai! Semua alat sudah punya kode.');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

backfill();
