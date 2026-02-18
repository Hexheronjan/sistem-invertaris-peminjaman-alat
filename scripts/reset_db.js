const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Resetting database (Dropping tables)...')
    try {
        // Drop tables with CASCADE to remove constraints
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "log_aktivitas" CASCADE;`)
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "pengembalian" CASCADE;`)
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "peminjaman" CASCADE;`)
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "alat" CASCADE;`)
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "kategori" CASCADE;`)
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "users" CASCADE;`)
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "roles" CASCADE;`)

        console.log('✅ Tables dropped. Database is clean.')
    } catch (e) {
        console.error('❌ Error dropping tables:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
