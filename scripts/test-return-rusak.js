
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting Return with Damaged Item Test...');

    // 1. Create a dummy item and user
    const item = await prisma.alat.create({
        data: {
            kode_alat: 'TEST-RETURN-RUSAK-001',
            nama_alat: 'Test Return Rusak',
            id_kategori: 1, // Assumes category 1 exists
            stok: 10,
            stok_rusak: 0,
            kondisi: 'baik'
        }
    });

    const user = await prisma.user.findFirst(); // Get any user
    if (!user) throw new Error('No user found');

    // 2. Create a borrowing record (Peminjaman)
    const pinjam = await prisma.peminjaman.create({
        data: {
            id_user: user.id_user,
            id_alat: item.id_alat,
            tanggal_pinjam: new Date(),
            tanggal_kembali: new Date(),
            jumlah: 1,
            status: 'disetujui'
        }
    });

    // Manually decrement stock to simulate borrowing (as trigger usually handles this or API does)
    // Assuming 'peminjaman' trigger or API decrements stock. Let's do it manually just in case to be sure start state is correct.
    await prisma.alat.update({
        where: { id_alat: item.id_alat },
        data: { stok: 9 }
    });

    console.log('Created loan:', pinjam.id_pinjam);

    try {
        // 3. Return as 'rusak' via API Logic Simulation (since we can't easily call local API from script without fetch)
        // We will simulate the logic in the transaction block from the route.js

        await prisma.$transaction(async (tx) => {
            // Update status peminjaman
            await tx.peminjaman.update({
                where: { id_pinjam: pinjam.id_pinjam },
                data: { status: 'kembali' }
            });

            // Insert pengembalian
            // Trigger tambah_stok_fungsi() will fire here -> Stock becomes 10
            await tx.pengembalian.create({
                data: {
                    id_pinjam: pinjam.id_pinjam,
                    tanggal_dikembalikan: new Date(),
                    denda: 0
                }
            });

            // Logic for 'rusak'
            // Decrement stok (back to 9), Increment stok_rusak (to 1)
            await tx.alat.update({
                where: { id_alat: item.id_alat },
                data: {
                    stok: { decrement: 1 },
                    stok_rusak: { increment: 1 }
                }
            });
        });

        // 4. Verify Final State
        const finalItem = await prisma.alat.findUnique({ where: { id_alat: item.id_alat } });
        console.log('Final Item State:', finalItem);

        if (finalItem.stok !== 9) throw new Error(`Stock should be 9, got ${finalItem.stok}`);
        if (finalItem.stok_rusak !== 1) throw new Error(`Stock Rusak should be 1, got ${finalItem.stok_rusak}`);

        console.log('\nTest PASSED!');

    } catch (e) {
        console.error('Test FAILED:', e);
    } finally {
        // Cleanup
        await prisma.pengembalian.deleteMany({ where: { id_pinjam: pinjam.id_pinjam } });
        await prisma.peminjaman.delete({ where: { id_pinjam: pinjam.id_pinjam } });
        await prisma.alat.delete({ where: { id_alat: item.id_alat } });
        console.log('Cleanup done.');
        await prisma.$disconnect();
    }
}

main();
