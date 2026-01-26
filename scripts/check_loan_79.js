
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- INSPECTING LOAN 79 ---');
    const loan = await prisma.peminjaman.findUnique({
        where: { id_pinjam: 79 },
        include: { alat: true, user: true }
    });
    console.log('LOAN 79:', loan);

    if (loan) {
        // Simulate Logic Check on this specific loan
        console.log('Simulating Stock Check for Loan 79...');
        const freshAlat = await prisma.alat.findUnique({ where: { id_alat: loan.id_alat } });
        console.log('Tool State:', freshAlat);

        if (!freshAlat || freshAlat.stok < loan.jumlah) {
            console.log('WARNING: Stock insufficient!');
        } else {
            console.log('Stock sufficient.');
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
