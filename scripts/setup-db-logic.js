const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start setup DB logic (Functions & Triggers)...');

    // 1. Function Hitung Denda
    await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION hitung_denda(tgl_kembali DATE, tgl_dikembalikan DATE)
    RETURNS INT AS $$
    DECLARE
        selisih INT;
    BEGIN
        selisih := tgl_dikembalikan - tgl_kembali;
    
        IF selisih > 0 THEN
            RETURN selisih * 1000;
        ELSE
            RETURN 0;
        END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);

    // 2. Trigger Kurangi Stok
    await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION kurangi_stok_fungsi()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.status = 'disetujui' THEN
            UPDATE alat
            SET stok = stok - 1
            WHERE id_alat = NEW.id_alat;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

    try {
        await prisma.$executeRawUnsafe(`
        CREATE TRIGGER kurangi_stok
        AFTER UPDATE ON peminjaman
        FOR EACH ROW
        EXECUTE FUNCTION kurangi_stok_fungsi();
    `);
    } catch (e) {
        console.log('Trigger kurangi_stok might already exist.');
    }

    // 3. Trigger Tambah Stok
    await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION tambah_stok_fungsi()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE alat
        SET stok = stok + 1
        WHERE id_alat = (
            SELECT id_alat FROM peminjaman WHERE id_pinjam = NEW.id_pinjam
        );
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

    try {
        await prisma.$executeRawUnsafe(`
        CREATE TRIGGER tambah_stok
        AFTER INSERT ON pengembalian
        FOR EACH ROW
        EXECUTE FUNCTION tambah_stok_fungsi();
    `);
    } catch (e) {
        console.log('Trigger tambah_stok might already exist.');
    }

    // 4. Seed Initial Data (Roles, Kategori, User Admin)
    // Check if roles exist
    const rolesCount = await prisma.role.count();
    if (rolesCount === 0) {
        await prisma.role.createMany({
            data: [
                { nama_role: 'admin' },
                { nama_role: 'petugas' },
                { nama_role: 'peminjam' }
            ]
        });
        console.log('Roles seeded.');
    }

    // 5. Seed Transaction Data from User Prompt (Kategori & Alat)
    const kategoriCount = await prisma.kategori.count();
    if (kategoriCount === 0) {
        // INSERT INTO kategori (nama_kategori) VALUES ('Elektronik');
        const kat = await prisma.kategori.create({
            data: { nama_kategori: 'Elektronik' }
        });
        console.log('Kategori seeded.');

        // INSERT INTO alat ... VALUES ('Proyektor', 1, 5);
        await prisma.alat.create({
            data: {
                nama_alat: 'Proyektor',
                id_kategori: kat.id_kategori,
                stok: 5,
                kondisi: 'baik'
            }
        });
        console.log('Alat seeded.');
    }

    console.log('Setup DB Logic & Seeding Completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
