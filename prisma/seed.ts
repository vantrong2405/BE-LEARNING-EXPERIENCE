import { PrismaClient } from '@prisma/client';
import { HashingService } from '../src/shared/services/hashing.service';
const prisma = new PrismaClient();
const hashingService = new HashingService();

async function main() {
    // Seeding RoleTypes
    enum RoleType {
        User = 0,
        Instructor = 1,
        Admin = 2
    }

    // Hash the password
    const hashedPassword = await hashingService.hash('Admin123@');

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
                password: hashedPassword,
                roleId: RoleType.Instructor,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1992-05-15'),
                avatarUrl: 'http://localhost:4000/static/image/5d92d127-e922-456f-98ca-6fcac8fec3b9.jpg',
                bio: 'Experienced Instructor',
                gender: 'Male',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                username: 'jane_smith',
                name: 'Jane Smith',
                email: 'user@example.com',
                password: hashedPassword,
                roleId: RoleType.User,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1995-09-25'),
                avatarUrl: 'http://localhost:4000/static/image/66b37b49-c998-4b31-8b2a-203292c27667.png',
                bio: 'Learning enthusiast',
                gender: 'Female',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                username: 'admin_user',
                name: 'System Admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                roleId: RoleType.Admin,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1990-01-01'),
                avatarUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
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
                thumbnailUrl: 'http://localhost:4000/static/image/95580e02-bea5-49f5-9da0-4ef95e94e8bb.jpg',
                bannerUrl: 'http://localhost:4000/static/image/993b59e5-87b0-4cc9-8f10-ff3339efe998.jpg',
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
                thumbnailUrl: 'http://localhost:4000/static/image/bb51b7fa-f795-48e7-9b97-030485bf3b9d.jpg',
                bannerUrl: 'http://localhost:4000/static/image/c27cc248-27d3-4265-922b-81a48e6cab84.png',
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
                thumbnailUrl: 'http://localhost:4000/static/image/dc80be9a-76cf-4f06-9cd0-489cd0bb7b7d.jpg',
                bannerUrl: 'http://localhost:4000/static/image/fe8bf888-b776-4a94-a735-af6287b865b6.png',
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
                thumbnailUrl: 'http://localhost:4000/static/image/05f9e920-a40a-4aef-8ca5-9290d556f37c.jpg',
                bannerUrl: 'http://localhost:4000/static/image/d8c6a9bc-5ff1-4a6f-a66d-fe2ed9072262.png',
                instructorId: 1,
                categoryId: 4,
                isPublished: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
        skipDuplicates: true,
    });

    // Seeding Lessons and Videos
    await prisma.lesson.createMany({
        data: [
            { courseId: 1, title: 'Lesson 1 - Intro', content: 'Introduction', order: 1, createdAt: new Date() },
            { courseId: 1, title: 'Lesson 2 - Basics', content: 'Programming Basics', order: 2, createdAt: new Date() },
            { courseId: 2, title: 'Lesson 1 - UI/UX Principles', content: 'Fundamentals of UI/UX', order: 1, createdAt: new Date() },
            { courseId: 2, title: 'Lesson 2 - Advanced UI Design', content: 'Deep dive into UI', order: 2, createdAt: new Date() },
        ],
        skipDuplicates: true,
    });

    // Seeding Videos
    await prisma.video.createMany({
        data: [
            {
                lessonId: 1,
                videoUrl: 'http://localhost:4000/static/video-stream/3286efb7-ad94-4184-8399-0a3e3e309a65.mp4',
                duration: 300,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                lessonId: 2,
                videoUrl: 'http://localhost:4000/static/video-stream/5c1db9c5-0082-4df3-953a-450953691a46.mp4',
                duration: 450,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                lessonId: 3,
                videoUrl: 'http://localhost:4000/static/video-stream/6d16b3eb-a7a8-404f-acaa-fe8bdf5e7a97.mp4',
                duration: 600,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                lessonId: 4,
                videoUrl: 'http://localhost:4000/static/video-stream/9690331b-b455-4d49-8923-daf88d5fc148.mp4',
                duration: 750,
                createdAt: new Date(),
                updatedAt: new Date()
            },
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
