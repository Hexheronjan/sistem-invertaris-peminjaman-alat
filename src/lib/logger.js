import prisma from '@/lib/prisma';

export async function logActivity(id_user, aktivitas) {
    try {
        if (!id_user) return; // Tidak bisa log jika tidak ada user (kecuali system log, tapi tabel butuh id_user nullable kah? schema user nullable)

        // FITUR TAMBAHAN: Hapus Log Otomatis > 30 Hari
        // Kita lakukan cleanup setiap kali ada log baru (Lazy Cleanup)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await prisma.logAktivitas.deleteMany({
            where: {
                waktu: {
                    lt: thirtyDaysAgo
                }
            }
        });

        await prisma.logAktivitas.create({
            data: {
                id_user: Number(id_user),
                aktivitas: aktivitas,
                waktu: new Date()
            }
        });
    } catch (error) {
        console.error('Gagal mencatat log:', error);
        // Jangan throw error agar tidak mengganggu flow utama
    }
}
