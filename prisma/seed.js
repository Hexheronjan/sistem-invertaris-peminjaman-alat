const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Create Roles with fixed IDs to match Frontend hardcoded values
    // Frontend expects: 1=Admin, 2=Petugas, 3=Peminjam
    const roles = [
        { id: 1, name: 'admin' }, // Title case 'Admin' might be better for display, but let's stick to lowercase if app expects it
        { id: 2, name: 'petugas' },
        { id: 3, name: 'peminjam' }
    ]

    console.log('Upserting roles...')
    for (const r of roles) {
        // We try to find by ID first, if not found, we create with specific ID
        // Note: Inserting with explicit ID is allowed in Postgres even with autoincrement
        const existing = await prisma.role.findUnique({ where: { id_role: r.id } })

        if (!existing) {
            await prisma.role.create({
                data: {
                    id_role: r.id, // Force ID
                    nama_role: r.name
                }
            })
            console.log(`Created role: ${r.name} (ID: ${r.id})`)
        } else {
            // Update name if needed
            await prisma.role.update({
                where: { id_role: r.id },
                data: { nama_role: r.name }
            })
            console.log(`Updated role: ${r.name} (ID: ${r.id})`)
        }
    }

    // 2. Adjust Sequence (Optional but good practice)
    // Since we manually inserted IDs, we should update the sequence to avoid conflicts later
    try {
        await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('roles', 'id_role'), 3, true);`
    } catch (e) {
        console.log('Skipping sequence update (might not be needed or permissions issue)')
    }

    // 3. Ensure 'admin' user exists
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const user = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: hashedPassword,
            status: 'aktif',
            id_role: 1 // Ensure linked to Admin role
        },
        create: {
            nama: 'Administrator',
            username: 'admin',
            password: hashedPassword,
            id_role: 1,
            status: 'aktif'
        },
    })

    console.log('Admin user seeded:', user.username)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
