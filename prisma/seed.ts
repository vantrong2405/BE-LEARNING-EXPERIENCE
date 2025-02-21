import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding roles...')

    await prisma.role.createMany({
        data: [
            { name: 'User', description: 'Học viên có thể mua khóa học' },
            { name: 'Instructor', description: 'Người hướng dẫn có thể tạo & bán khóa học' },
            { name: 'Admin', description: 'Quản trị viên có quyền quản lý toàn bộ hệ thống' },
        ],
        skipDuplicates: true,
    })

    console.log('Seeding admin user...')

    const adminRole = await prisma.role.findUnique({
        where: { name: 'Admin' }
    })

    if (adminRole) {
        const hashedPassword = await bcrypt.hash('admin123', 10)
        await prisma.user.create({
            data: {
                username: 'admin',
                name: 'System Admin',
                email: 'admin@example.com',
                password: hashedPassword,
                roleId: adminRole.id,
                verify: 1,
                dateOfBirth: new Date('1990-01-01'),
            }
        })
    }

    console.log('Seeding completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
