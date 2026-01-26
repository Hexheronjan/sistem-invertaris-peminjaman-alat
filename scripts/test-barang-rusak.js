
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting Barang Rusak Test...');

    // 1. Create a dummy item
    const item = await prisma.alat.create({
        data: {
            kode_alat: 'TEST-RUSAK-001',
            nama_alat: 'Test Item Rusak',
            id_kategori: 1, // Assumes category 1 exists
            stok: 10,
            stok_rusak: 0,
            kondisi: 'baik'
        }
    });
    console.log('Created item:', item);

    try {
        // 2. Mark 2 items as damaged
        console.log('\nMarking 2 items as damaged...');
        const damaged = await prisma.alat.update({
            where: { id_alat: item.id_alat },
            data: {
                stok: { decrement: 2 },
                stok_rusak: { increment: 2 }
            }
        });
        console.log('After damage:', damaged);
        if (damaged.stok !== 8 || damaged.stok_rusak !== 2) {
            throw new Error('Failed to mark as damaged');
        }

        // 3. Repair 1 item
        console.log('\nRepairing 1 item...');
        const repaired = await prisma.alat.update({
            where: { id_alat: item.id_alat },
            data: {
                stok: { increment: 1 },
                stok_rusak: { decrement: 1 }
            }
        });
        console.log('After repair:', repaired);
        if (repaired.stok !== 9 || repaired.stok_rusak !== 1) {
            throw new Error('Failed to repair');
        }

        console.log('\nTest PASSED!');

    } catch (e) {
        console.error('Test FAILED:', e);
    } finally {
        // Cleanup
        await prisma.alat.delete({ where: { id_alat: item.id_alat } });
        console.log('Cleanup done.');
        await prisma.$disconnect();
    }
}

main();
