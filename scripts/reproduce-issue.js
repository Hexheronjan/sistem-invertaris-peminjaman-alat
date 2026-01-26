
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- REPRODUCTION SCRIPT START ---');

    // 1. Setup Data
    // Create Item
    const item = await prisma.alat.create({
        data: {
            kode_alat: 'DEBUG-BOR-001',
            nama_alat: 'Debug Bor Listrik',
            id_kategori: 1,
            stok: 10,
            stok_rusak: 0,
            kondisi: 'baik'
        }
    });

    // Create User
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found');

    // Create Loan (Borrowed 1)
    const loan = await prisma.peminjaman.create({
        data: {
            id_user: user.id_user,
            id_alat: item.id_alat,
            jumlah: 1,
            status: 'disetujui',
            tanggal_pinjam: new Date(),
            tanggal_kembali: new Date()
        }
    });

    // Simulate borrowing stock reduction (if trigger handles it)
    // Wait, let's check if there is a borrowing trigger.
    // If not, API/Frontend usually handles it.
    // Assuming effective stock should be 9.
    await prisma.alat.update({
        where: { id_alat: item.id_alat },
        data: { stok: 9 }
    });

    console.log('Setup: Item created, Loan created. Stock: 9, Rusak: 0');

    // 2. Execute Return Logic (Simulating API Route)
    console.log('Simulating Return with condition "rusak"...');

    const body = {
        id_pinjam: loan.id_pinjam,
        tanggal_dikembalikan: new Date().toISOString().split('T')[0],
        kondisi_akhir: 'rusak', // THE CRITICAL PART
        deskripsi: 'Broken by script'
    };

    // We can't call Next.js API directly easily, so we copy the LOGIC here to test the TRANSATCTION/TRIGGER interaction.
    // Logic from route.js:

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update status peminjaman
            await tx.peminjaman.update({
                where: { id_pinjam: loan.id_pinjam },
                data: { status: 'kembali' }
            });

            // 2. Insert pengembalian
            // TRIGGER 'tambah_stok_fungsi' SHOULD FIRE NOW?
            await tx.pengembalian.create({
                data: {
                    id_pinjam: loan.id_pinjam,
                    tanggal_dikembalikan: new Date(),
                    denda: 0
                }
            });

            // 3. Handle Barang Rusak
            const pinjam = loan;
            if (body.kondisi_akhir === 'rusak') {
                // The fix logic: decrement stok, increment stok_rusak
                await tx.alat.update({
                    where: { id_alat: pinjam.id_alat },
                    data: {
                        stok: { decrement: pinjam.jumlah },
                        stok_rusak: { increment: pinjam.jumlah }
                    }
                });
            }
        });

        console.log('Transaction success.');

    } catch (e) {
        console.error('Transaction failed:', e);
    }

    // 3. Verify Result
    const finalItem = await prisma.alat.findUnique({ where: { id_alat: item.id_alat } });
    console.log('Final State:', finalItem);

    if (finalItem.stok !== 9) {
        console.error('FAIL: Stok should be 9 (returned to 10 by trigger, then decremented to 9 by logic). Got:', finalItem.stok);
    } else {
        console.log('PASS: Stok is correct (9).');
    }

    if (finalItem.stok_rusak !== 1) {
        console.error('FAIL: Stok Rusak should be 1. Got:', finalItem.stok_rusak);
    } else {
        console.log('PASS: Stok Rusak is correct (1).');
    }

    // Cleanup
    // await prisma.alat.delete({ where: { id_alat: item.id_alat } }); // Keep for inspection if needed, or delete.
    console.log('--- REPRODUCTION SCRIPT END ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
