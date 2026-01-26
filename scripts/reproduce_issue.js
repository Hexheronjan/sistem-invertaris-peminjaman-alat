
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- RESEP: Reproduksi Masalah Stok ---');

    // 1. Buat Kategori Dummy
    const kategori = await prisma.kategori.create({
        data: { nama_kategori: 'Test Kat ' + Date.now() }
    });

    // 2. Buat Alat Dummy (Stok 10)
    const alat = await prisma.alat.create({
        data: {
            nama_alat: 'Test Alat ' + Date.now(),
            id_kategori: kategori.id_kategori,
            stok: 10,
            kondisi: 'baik'
        }
    });
    console.log(`[INIT] Alat created. Stok: ${alat.stok} (Expect 10)`);

    // 3. Buat User Dummy
    const role = await prisma.role.findFirst();
    const user = await prisma.user.create({
        data: {
            nama: 'Test User',
            username: 'testuser' + Date.now(),
            password: 'password',
            id_role: role.id_role
        }
    });

    // 4. Pinjam 5
    const pinjam = await prisma.peminjaman.create({
        data: {
            id_user: user.id_user,
            id_alat: alat.id_alat,
            tanggal_pinjam: new Date(),
            tanggal_kembali: new Date(),
            jumlah: 5,
            status: 'pengajuan'
        }
    });
    console.log(`[PINJAM] Peminjaman created (status: pengajuan).`);

    // Cek stok (Harusnya masih 10)
    let alatCheck = await prisma.alat.findUnique({ where: { id_alat: alat.id_alat } });
    console.log(`[CHECK 1] Stok saat pengajuan: ${alatCheck.stok} (Expect 10)`);

    // 5. Approve (Update status -> disetujui)
    await prisma.peminjaman.update({
        where: { id_pinjam: pinjam.id_pinjam },
        data: { status: 'disetujui' }
    });
    console.log(`[APPROVE] Status updated to 'disetujui'.`);

    // Cek stok (Harusnya 5)
    alatCheck = await prisma.alat.findUnique({ where: { id_alat: alat.id_alat } });
    console.log(`[CHECK 2] Stok saat disetujui: ${alatCheck.stok} (Expect 5)`);

    if (alatCheck.stok !== 5) {
        console.error("!!! ERROR: Stok tidak berkurang! Trigger gagal.");
    } else {
        console.log("SUCCESS: Stok berkurang dengan benar.");
    }

    // 6. Return (Update status -> kembali, Insert Pengembalian)
    // Simulation of /api/pengembalian
    await prisma.$transaction(async (tx) => {
        await tx.peminjaman.update({
            where: { id_pinjam: pinjam.id_pinjam },
            data: { status: 'kembali' }
        });
        await tx.pengembalian.create({
            data: {
                id_pinjam: pinjam.id_pinjam,
                tanggal_dikembalikan: new Date(),
                denda: 0
            }
        });
    });
    console.log(`[RETURN] Barang dikembalikan.`);

    // Cek stok (Harusnya 10)
    alatCheck = await prisma.alat.findUnique({ where: { id_alat: alat.id_alat } });
    console.log(`[CHECK 3] Stok saat kembali: ${alatCheck.stok} (Expect 10)`);

    if (alatCheck.stok !== 10) {
        console.error(`!!! ERROR: Stok salah! Got ${alatCheck.stok}, expected 10.`);
    } else {
        console.log("SUCCESS: Stok kembali normal.");
    }

    // Cleanup
    await prisma.pengembalian.deleteMany({ where: { id_pinjam: pinjam.id_pinjam } });
    await prisma.peminjaman.deleteMany({ where: { id_user: user.id_user } });
    await prisma.user.delete({ where: { id_user: user.id_user } });
    await prisma.alat.delete({ where: { id_alat: alat.id_alat } });
    await prisma.kategori.delete({ where: { id_kategori: kategori.id_kategori } });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
