const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdmin() {
    try {
        const username = 'admin';
        const newPassword = '123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log(`🔄 Mereset password untuk user '${username}'...`);

        // Cek apakah user ada
        const user = await prisma.user.findUnique({ where: { username } });

        if (user) {
            // Update password
            await prisma.user.update({
                where: { username },
                data: { password: hashedPassword }
            });
            console.log(`✅ Password berhasil diubah menjadi '${newPassword}'`);
        } else {
            console.log(`⚠️ User '${username}' tidak ditemukan. Membuat baru...`);
            // Buat baru jika tidak ada
            await prisma.user.create({
                data: {
                    nama: 'Administrator',
                    username: 'admin',
                    password: hashedPassword,
                    id_role: 1, // Admin
                    status: 'aktif'
                }
            });
            console.log(`✅ User '${username}' berhasil dibuat dengan password '${newPassword}'`);
        }
    } catch (e) {
        console.error('❌ Terjadi kesalahan:', e);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdmin();
