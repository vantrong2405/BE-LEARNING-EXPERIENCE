import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Seeding RoleTypes
    enum RoleType {
        User = 0,
        Instructor = 1,
        Admin = 2
    }

    // Seeding Roles
    await prisma.role.createMany({
        data: [
            { id: RoleType.User, name: 'User', description: 'Regular user with basic access' },
            { id: RoleType.Instructor, name: 'Instructor', description: 'Course instructor with teaching privileges' },
            { id: RoleType.Admin, name: 'Admin', description: 'System administrator with full access' }
        ],
        skipDuplicates: true,
    });

    // Seeding Categories
    await prisma.category.createMany({
        data: [
            { name: 'Programming' },
            { name: 'Design' },
            { name: 'Marketing' },
            { name: 'Business' },
        ],
        skipDuplicates: true,
    });

    // Seeding Users
    await prisma.user.createMany({
        data: [
            {
                username: 'john_doe',
                name: 'John Doe',
                email: 'instructor@example.com',
                password: '123123',
                roleId: RoleType.Instructor,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1992-05-15'),
                avatarUrl: '',
                bio: 'Experienced Instructor',
                gender: 'Male',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                username: 'jane_smith',
                name: 'Jane Smith',
                email: 'user@example.com',
                password: '123123',
                roleId: RoleType.User,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1995-09-25'),
                avatarUrl: '',
                bio: 'Learning enthusiast',
                gender: 'Female',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                username: 'admin_user',
                name: 'System Admin',
                email: 'admin@gmail.com',
                password: '123123',
                roleId: RoleType.Admin,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1990-01-01'),
                avatarUrl: '',
                bio: 'System Administrator',
                gender: 'Other',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
        skipDuplicates: true,
    });

    // Seeding Courses
    await prisma.course.createMany({
        data: [
            {
                title: 'Intro to Programming',
                description: 'Learn the basics of programming.',
                price: 49.99,
                thumbnailUrl: '',
                bannerUrl: '',
                instructorId: 1,
                categoryId: 1,
                isPublished: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title: 'Advanced Design',
                description: 'Deep dive into UI/UX.',
                price: 79.99,
                thumbnailUrl: '',
                bannerUrl: '',
                instructorId: 1,
                categoryId: 2,
                isPublished: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title: 'Marketing Strategies',
                description: 'Learn modern marketing techniques.',
                price: 59.99,
                thumbnailUrl: '',
                bannerUrl: '',
                instructorId: 1,
                categoryId: 3,
                isPublished: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                title: 'Business Analytics',
                description: 'Understand data analytics for business.',
                price: 89.99,
                thumbnailUrl: '',
                bannerUrl: '',
                instructorId: 1,
                categoryId: 4,
                isPublished: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
        skipDuplicates: true,
    });

    // Seeding Lessons
    await prisma.lesson.createMany({
        data: [
            { courseId: 1, title: 'Lesson 1 - Intro', content: 'Introduction', order: 1, createdAt: new Date() },
            { courseId: 1, title: 'Lesson 2 - Basics', content: 'Programming Basics', order: 2, createdAt: new Date() },
            { courseId: 2, title: 'Lesson 1 - UI/UX Principles', content: 'Fundamentals of UI/UX', order: 1, createdAt: new Date() },
            { courseId: 2, title: 'Lesson 2 - Advanced UI Design', content: 'Deep dive into UI', order: 2, createdAt: new Date() },
        ],
        skipDuplicates: true,
    });

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
