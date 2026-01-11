import prisma from '@/lib/prisma';

export async function logActivity(id_user, aktivitas) {
    try {
        if (!id_user) return; // Tidak bisa log jika tidak ada user (kecuali system log, tapi tabel butuh id_user nullable kah? schema user nullable)

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
