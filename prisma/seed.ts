import { PrismaClient } from '@prisma/client';
import { HashingService } from '../src/shared/services/hashing.service';

const prisma = new PrismaClient();
const hashingService = new HashingService();

async function main() {
    console.log('🚀 Starting seeding...');

    // **Seeding Categories**
    const categories = await prisma.category.createMany({
        data: [
            { name: 'Programming' },
            { name: 'Design' },
            { name: 'Marketing' },
            { name: 'Business' },
            { name: 'Data Science' },
            { name: 'Language' },
        ],
        skipDuplicates: true,
    });

    // **Seeding Levels**
    const levels = await prisma.level.createMany({
        data: [
            { name: 'Beginner', description: 'Dành cho người mới bắt đầu' },
            { name: 'Intermediate', description: 'Dành cho người có kiến thức cơ bản' },
            { name: 'Advanced', description: 'Dành cho người đã có kinh nghiệm' },
        ],
        skipDuplicates: true,
    });

    // **Hash mật khẩu mẫu**
    const hashedPassword = await hashingService.hash('Admin123@');

    // **Seeding Users**
    const instructor = await prisma.user.create({
        data: {
            username: 'john_instructor',
            name: 'John Smith',
            email: 'instructor@example.com',
            password: hashedPassword,
            role: 'Instructor',
            verify: 1,
            status_account: 1,
            dateOfBirth: new Date('1985-05-15'),
            avatarUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            bio: 'Expert in web development',
            gender: 'Male',
        }
    });

    await prisma.user.create({
        data: {
            username: 'admin_super',
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'Admin',
            verify: 1,
            status_account: 1,
            dateOfBirth: new Date('1990-01-01'),
            avatarUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            bio: 'System Administrator',
            gender: 'Other',
        }
    });

    // Get category and level references
    const programmingCategory = await prisma.category.findFirst({ where: { name: 'Programming' } });
    const designCategory = await prisma.category.findFirst({ where: { name: 'Design' } });
    const marketingCategory = await prisma.category.findFirst({ where: { name: 'Marketing' } });
    const dataScienceCategory = await prisma.category.findFirst({ where: { name: 'Data Science' } });

    const beginnerLevel = await prisma.level.findFirst({ where: { name: 'Beginner' } });
    const intermediateLevel = await prisma.level.findFirst({ where: { name: 'Intermediate' } });
    const advancedLevel = await prisma.level.findFirst({ where: { name: 'Advanced' } });

    // **Seeding Courses**
    const webDevCourse = await prisma.course.create({
        data: {
            title: 'Complete Web Development Bootcamp',
            description: 'Learn full-stack web development from scratch',
            price: 99.99,
            thumbnailUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            bannerUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            instructorId: instructor.id,
            categoryId: programmingCategory?.id,
            levelId: beginnerLevel?.id,
            isPublished: true,
            rating: 4.8,
            totalReviews: 1200,
            moneyBackGuarantee: true,
            videoHours: 50,
            articlesCount: 30,
            downloadableResources: 20,
            lifetimeAccess: true,
            certificate: true,
            courseOverview: 'Master HTML, CSS, JavaScript, and React.',
            learningObjectives: 'Build dynamic web applications, work with databases, and deploy projects.',
            courseFeatures: '50+ hours of content, projects, and assessments.',
            requirements: 'Basic knowledge of HTML & CSS is recommended.',
        }
    });

    const advJsCourse = await prisma.course.create({
        data: {
            title: 'Advanced JavaScript & Node.js',
            description: 'Deep dive into JavaScript, ES6, and Node.js for backend development',
            price: 129.99,
            thumbnailUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            bannerUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            instructorId: instructor.id,
            categoryId: programmingCategory?.id,
            levelId: advancedLevel?.id,
            isPublished: true,
            rating: 4.7,
            totalReviews: 850,
            moneyBackGuarantee: true,
            videoHours: 40,
            articlesCount: 20,
            downloadableResources: 15,
            lifetimeAccess: true,
            certificate: true,
            courseOverview: 'Master JavaScript & Node.js backend development.',
            learningObjectives: 'Learn asynchronous programming, REST API, and authentication.',
            courseFeatures: '40+ hours of hands-on coding exercises.',
            requirements: 'Good understanding of JavaScript fundamentals.',
        }
    });

    await prisma.course.create({
        data: {
            title: 'UI/UX Design with Figma & Adobe XD',
            description: 'Master modern UI/UX design principles and tools',
            price: 89.99,
            thumbnailUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            bannerUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            instructorId: instructor.id,
            categoryId: designCategory?.id,
            levelId: intermediateLevel?.id,
            isPublished: true,
            rating: 4.6,
            totalReviews: 600,
            moneyBackGuarantee: true,
            videoHours: 35,
            articlesCount: 15,
            downloadableResources: 10,
            lifetimeAccess: true,
            certificate: true,
            courseOverview: 'Learn design thinking, wireframing, and prototyping.',
            learningObjectives: 'Create high-quality UI designs with Figma & Adobe XD.',
            courseFeatures: 'Real-world UI/UX projects and case studies.',
            requirements: 'No prior experience required, just creativity!',
        }
    });

    await prisma.course.create({
        data: {
            title: 'Python for Data Science & Machine Learning',
            description: 'Comprehensive course on Python for data analysis and AI',
            price: 109.99,
            thumbnailUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            bannerUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            instructorId: instructor.id,
            categoryId: dataScienceCategory?.id,
            levelId: intermediateLevel?.id,
            isPublished: true,
            rating: 4.9,
            totalReviews: 2200,
            moneyBackGuarantee: true,
            videoHours: 60,
            articlesCount: 40,
            downloadableResources: 25,
            lifetimeAccess: true,
            certificate: true,
            courseOverview: 'Master Python, NumPy, Pandas, and Machine Learning models.',
            learningObjectives: 'Analyze data, create AI models, and visualize insights.',
            courseFeatures: 'Real-world datasets and ML projects.',
            requirements: 'Basic understanding of Python recommended.',
        }
    });

    await prisma.course.create({
        data: {
            title: 'Digital Marketing Masterclass',
            description: 'Learn SEO, social media marketing, and PPC advertising',
            price: 79.99,
            thumbnailUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            bannerUrl: 'http://localhost:4000/static/image/7c4867ac-e557-45ca-b7a3-0496032a1a0a.png',
            instructorId: instructor.id,
            categoryId: marketingCategory?.id,
            levelId: beginnerLevel?.id,
            isPublished: true,
            rating: 4.5,
            totalReviews: 500,
            moneyBackGuarantee: true,
            videoHours: 30,
            articlesCount: 10,
            downloadableResources: 5,
            lifetimeAccess: true,
            certificate: true,
            courseOverview: 'Learn marketing strategies for businesses and brands.',
            learningObjectives: 'SEO optimization, Facebook & Google Ads mastery.',
            courseFeatures: 'Practical marketing campaigns and analytics.',
            requirements: 'No prior marketing knowledge required.',
        }
    });

    // **Seeding Lessons**
    const lessons = await prisma.lesson.createMany({
        data: [
            { courseId: webDevCourse.id, title: 'HTML & CSS Basics', content: 'Learn how to structure web pages.', order: 1 },
            { courseId: webDevCourse.id, title: 'JavaScript Fundamentals', content: 'Learn core JavaScript concepts.', order: 2 },
            { courseId: advJsCourse.id, title: 'React Hooks & Context API', content: 'Master React state management.', order: 1 },
        ],
        skipDuplicates: true,
    });

    // Get lessons for videos
    const htmlLesson = await prisma.lesson.findFirst({
        where: { title: 'HTML & CSS Basics' }
    });

    const jsLesson = await prisma.lesson.findFirst({
        where: { title: 'JavaScript Fundamentals' }
    });

    if (htmlLesson && jsLesson) {
        // **Seeding Videos**
        await prisma.video.createMany({
            data: [
                {
                    lessonId: htmlLesson.id,
                    courseId: webDevCourse.id,
                    title: 'HTML & CSS Basics Video',
                    videoUrl: 'http://localhost:4000/static/video-stream/3286efb7-ad94-4184-8399-0a3e3e309a65.mp4',
                    duration: 600,
                    orderLesson: 1
                },
                {
                    lessonId: jsLesson.id,
                    courseId: webDevCourse.id,
                    title: 'JavaScript Fundamentals Video',
                    videoUrl: 'http://localhost:4000/static/video-stream/3286efb7-ad94-4184-8399-0a3e3e309a65.mp4',
                    duration: 900,
                    orderLesson: 2
                },
            ],
            skipDuplicates: true,
        });
    }

    // **Seeding FAQs**
    await prisma.faq.createMany({
        data: [
            { courseId: webDevCourse.id, question: 'How long do I have access to the course?', answer: 'Lifetime access' },
            { courseId: advJsCourse.id, question: 'Do I get a certificate?', answer: 'Yes, upon completion' },
        ],
        skipDuplicates: true,
    });

    // **Seeding Reviews**
    await prisma.review.createMany({
        data: [
            { userId: instructor.id, courseId: webDevCourse.id, rating: 5, comment: 'Fantastic course!' },
            { userId: instructor.id, courseId: advJsCourse.id, rating: 4, comment: 'Very detailed and informative.' },
        ],
        skipDuplicates: true,
    });

    console.log('✅ Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
