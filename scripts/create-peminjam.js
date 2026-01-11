const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createPeminjam() {
    try {
        const username = 'peminjam1';
        const password = '123';
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`🔄 Membuat user peminjam...`);

        // Cek apakah user ada
        const user = await prisma.user.findUnique({ where: { username } });

        if (user) {
            // Update password
            await prisma.user.update({
                where: { username },
                data: {
                    password: hashedPassword,
                    id_role: 3 // Pastikan role peminjam
                }
            });
            console.log(`✅ User '${username}' sudah ada. Password direset ke '${password}'`);
        } else {
            // Buat baru
            await prisma.user.create({
                data: {
                    nama: 'Siswa Peminjam',
                    username: username,
                    password: hashedPassword,
                    id_role: 3, // 3 = Peminjam
                    status: 'aktif'
                }
            });
            console.log(`✅ User '${username}' berhasil dibuat dengan password '${password}'`);
        }
    } catch (e) {
        console.error('❌ Terjadi kesalahan:', e);
    } finally {
        await prisma.$disconnect();
    }
}

createPeminjam();
