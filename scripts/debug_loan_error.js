
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- TRIGGERING API ERROR ---');
    // Using fetch against the running server might be tricky if auth is involved or if we are outside the network.
    // Instead, I will simulate the logic by running the route function's logic directly if possible, or just call the prisma transaction logic.
    // But since the error is 500 from API, it's best to check the logic. 
    // Let's dry-run the logic on a specific loan ID (e.g. 79 from user report or any pending loan).

    // Find a pending loan
    const loan = await prisma.peminjaman.findFirst({
        where: { status: 'pengajuan' },
        include: { alat: true }
    });

    if (!loan) {
        console.log('No pending loan found to test.');
        return;
    }
    console.log('Testing approval for loan:', loan.id_pinjam);

    // Simulate approval logic
    try {
        await prisma.$transaction(async (tx) => {
            const currentPinjam = await tx.peminjaman.findUnique({
                where: { id_pinjam: loan.id_pinjam },
                include: { alat: true }
            });
            console.log('Current:', currentPinjam);

            // Logic A: Approve
            if (currentPinjam.status !== 'disetujui') {
                const freshAlat = await tx.alat.findUnique({ where: { id_alat: currentPinjam.id_alat } });
                console.log('Fresh Alat:', freshAlat);

                if (!freshAlat || freshAlat.stok < currentPinjam.jumlah) {
                    throw new Error('Stock low');
                }

                await tx.alat.update({
                    where: { id_alat: currentPinjam.id_alat },
                    data: { stok: { decrement: currentPinjam.jumlah } }
                });
                console.log('Stock decremented');
            }

            await tx.peminjaman.update({
                where: { id_pinjam: loan.id_pinjam },
                data: { status: 'disetujui' }
            });
        });
        console.log('SUCCESS: Logic seems fine in script context.');
    } catch (e) {
        console.error('ERROR in Script Context:', e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
