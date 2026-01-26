const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsage() {
    try {
        // 1. Cari ID Alat
        const tool = await prisma.alat.findFirst({
            where: { nama_alat: { contains: 'Bor Listrik Test', mode: 'insensitive' } }
        });

        if (!tool) {
            console.log('Alat "Bor Listrik Test" tidak ditemukan.');
            return;
        }

        console.log(`Ditemukan Alat: ${tool.nama_alat} (ID: ${tool.id_alat})`);

        // 2. Cari di Peminjaman
        const loans = await prisma.peminjaman.findMany({
            where: { id_alat: tool.id_alat },
            include: { user: true }
        });

        console.log(`\nJumlah Riwayat Peminjaman: ${loans.length}`);

        if (loans.length > 0) {
            console.log('Detail Peminjaman (Inilah penyebab tidak bisa dihapus):');
            loans.forEach((loan, idx) => {
                console.log(`${idx + 1}. Peminjam: ${loan.user.nama}, Status: ${loan.status}, Tgl: ${loan.tanggal_pinjam.toDateString()}`);
            });
        } else {
            console.log('Aneh... tidak ada record peminjaman. Cek constraint lain?');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsage();
