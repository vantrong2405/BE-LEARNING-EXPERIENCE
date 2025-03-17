import { PrismaClient, Prisma, Role } from '@prisma/client';
import { HashingService } from '../src/shared/services/hashing.service';

const prisma = new PrismaClient();
const hashingService = new HashingService();

async function main() {
    try {
        console.log('🚀 Starting seeding...');

        // **Seeding Categories**
        await prisma.category.createMany({
            data: [
                { name: 'Programming' },
                { name: 'Design' },
                { name: 'Marketing' },
                { name: 'Business' },
                { name: 'Data Science' },
                { name: 'Language' },
                { name: 'Project Management' },
                { name: 'Business Law' },
                { name: 'Excel' },
                { name: 'Personal Development' },
                { name: 'Finance' },
                { name: 'Photography' },
                { name: 'Music' },
                { name: 'Health & Fitness' }
            ],
            skipDuplicates: true,
        });

        // **Seeding Levels**
        await prisma.level.createMany({
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
                email: 'instructor@gmail.com',
                password: hashedPassword,
                role: 'Instructor' as Role,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1985-05-15'),
                avatarUrl: 'https://thumbs.dreamstime.com/b/young-indian-man-happy-outdoors-looking-camera-39595562.jpg',
                bio: 'Expert instructor with over 10 years of experience',
                gender: 'Male',
            }
        });

        const instructor2 = await prisma.user.create({
            data: {
                username: 'sarah_tech',
                name: 'Sarah Johnson',
                email: 'sarah@gmail.com',
                password: hashedPassword,
                role: 'Instructor' as Role,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1988-08-20'),
                avatarUrl: 'https://thumbs.dreamstime.com/b/portrait-happy-young-handsome-business-man-isolated-white-background-32373555.jpg',
                bio: 'Tech enthusiast and experienced educator',
                gender: 'Female',
            }
        });

        const instructor3 = await prisma.user.create({
            data: {
                username: 'david_finance',
                name: 'David Wilson',
                email: 'david@gmail.com',
                password: hashedPassword,
                role: 'Instructor' as Role,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1982-03-10'),
                avatarUrl: 'https://thumbs.dreamstime.com/z/indian-man-portrait-close-up-happy-young-56800239.jpg',
                bio: 'Financial expert with MBA from Harvard',
                gender: 'Male',
            }
        });

        await prisma.user.create({
            data: {
                username: 'admin_super',
                name: 'Admin User',
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'Admin' as Role,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1990-01-01'),
                avatarUrl: 'https://i.ytimg.com/vi/PK2TckbJz7o/maxresdefault.jpg',
                bio: 'System Administrator',
                gender: 'Other',
            }
        });

        // Create regular users
        const user1 = await prisma.user.create({
            data: {
                username: 'student1',
                name: 'Alice Brown',
                email: 'alice@gmail.com',
                password: hashedPassword,
                role: 'User' as Role,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1995-12-15'),
                avatarUrl: 'https://i.ytimg.com/vi/MwlRg4B7X0c/mqdefault.jpg',
                bio: 'Lifelong learner',
                gender: 'Female',
            }
        });

        const user2 = await prisma.user.create({
            data: {
                username: 'student2',
                name: 'Bob Chen',
                email: 'bob@gmail.com',
                password: hashedPassword,
                role: 'User' as Role,
                verify: 1,
                status_account: 1,
                dateOfBirth: new Date('1993-06-25'),
                avatarUrl: 'https://cdn.prod.website-files.com/66cc741779a1ebdde4fb3185/66cc741779a1ebdde4fb31ad_feature-1.png',
                bio: 'Tech enthusiast',
                gender: 'Male',
            }
        });

        // Get category and level references
        const dataCategory = await prisma.category.findFirst({ where: { name: 'Data Science' } });
        const excelCategory = await prisma.category.findFirst({ where: { name: 'Excel' } });
        const businessLawCategory = await prisma.category.findFirst({ where: { name: 'Business Law' } });
        const projectManagementCategory = await prisma.category.findFirst({ where: { name: 'Project Management' } });
        const programmingCategory = await prisma.category.findFirst({ where: { name: 'Programming' } });
        const financeCategory = await prisma.category.findFirst({ where: { name: 'Finance' } });
        const marketingCategory = await prisma.category.findFirst({ where: { name: 'Marketing' } });
        const photographyCategory = await prisma.category.findFirst({ where: { name: 'Photography' } });

        const beginnerLevel = await prisma.level.findFirst({ where: { name: 'Beginner' } });
        const intermediateLevel = await prisma.level.findFirst({ where: { name: 'Intermediate' } });
        const advancedLevel = await prisma.level.findFirst({ where: { name: 'Advanced' } });

        // **Seeding New Courses**
        const dataAnalysisCourse = await prisma.course.create({
            data: {
                title: 'Data Analysis Mastery',
                description: 'Master data analysis techniques and tools',
                price: 129.99,
                thumbnailUrl: 'https://i.ytimg.com/vi/jWj0sodsWog/maxresdefault.jpg',
                bannerUrl: 'https://lptech.asia/uploads/files/2023/06/06/tim-hieu-khoa-hoc-data-analytics-mo-rong-co-hoi-lam-viec-va-phat-trien-3.jpg',
                instructorId: instructor.id,
                categoryId: dataCategory?.id,
                levelId: advancedLevel?.id,
                isPublished: true,
                rating: 4.8,
                totalReviews: 850,
                moneyBackGuarantee: true,
                videoHours: 45,
                articlesCount: 25,
                downloadableResources: 15,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'Comprehensive data analysis course covering essential tools and techniques',
                learningObjectives: 'Master data analysis tools, statistical methods, and visualization techniques',
                courseFeatures: 'Real-world projects, hands-on exercises, and industry case studies',
                requirements: 'Basic understanding of statistics and spreadsheets',
            }
        });

        const excelCourse = await prisma.course.create({
            data: {
                title: 'Advanced Excel Skills',
                description: 'Master advanced Excel features for business analytics',
                price: 89.99,
                thumbnailUrl: 'https://trungtamtinhocdanang.com/wp-content/uploads/2021/11/khoa-hoc-excel-cap-toc-tu-co-ban-den-nang-cao.jpg',
                bannerUrl: 'https://tse1.mm.bing.net/th?id=OIP.KUb91M3UQjZzhlBn5_EwmwHaEV&pid=Api&P=0&h=180',
                instructorId: instructor.id,
                categoryId: excelCategory?.id,
                levelId: intermediateLevel?.id,
                isPublished: true,
                rating: 4.7,
                totalReviews: 1200,
                moneyBackGuarantee: true,
                videoHours: 35,
                articlesCount: 20,
                downloadableResources: 30,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'Master advanced Excel features and business analytics',
                learningObjectives: 'Learn advanced formulas, pivot tables, macros, and data analysis',
                courseFeatures: 'Practical exercises, real business cases, and templates',
                requirements: 'Basic Excel knowledge required',
            }
        });

        const businessLawCourse = await prisma.course.create({
            data: {
                title: 'Business Law Fundamentals',
                description: 'Essential legal knowledge for business professionals',
                price: 99.99,
                thumbnailUrl: 'https://tse3.mm.bing.net/th?id=OIP.YckuMgINHv97aN7G4AEogwHaFj&pid=Api&P=0&h=180',
                bannerUrl: 'https://tse3.mm.bing.net/th?id=OIP.YckuMgINHv97aN7G4AEogwHaFj&pid=Api&P=0&h=180',
                instructorId: instructor.id,
                categoryId: businessLawCategory?.id,
                levelId: beginnerLevel?.id,
                isPublished: true,
                rating: 4.6,
                totalReviews: 500,
                moneyBackGuarantee: true,
                videoHours: 30,
                articlesCount: 15,
                downloadableResources: 10,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'Comprehensive introduction to business law concepts',
                learningObjectives: 'Understand legal frameworks, contracts, and business regulations',
                courseFeatures: 'Case studies, legal document templates, and practical examples',
                requirements: 'No prior legal knowledge required',
            }
        });

        const agileCourse = await prisma.course.create({
            data: {
                title: 'Agile Project Management',
                description: 'Master Agile methodologies and Scrum framework',
                price: 119.99,
                thumbnailUrl: 'https://codestar.vn/wp-content/uploads/2023/03/MicrosoftTeams-image-39.png',
                bannerUrl: 'https://www.apexglobal.com.vn/wp-content/uploads/2021/04/Agile-01-800pixels-768x402.jpg',
                instructorId: instructor.id,
                categoryId: projectManagementCategory?.id,
                levelId: intermediateLevel?.id,
                isPublished: true,
                rating: 4.9,
                totalReviews: 750,
                moneyBackGuarantee: true,
                videoHours: 40,
                articlesCount: 25,
                downloadableResources: 20,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'Complete guide to Agile project management',
                learningObjectives: 'Master Scrum, Kanban, and Agile principles',
                courseFeatures: 'Real project simulations, templates, and certification prep',
                requirements: 'Basic project management knowledge recommended',
            }
        });

        // Additional new courses
        const pythonCourse = await prisma.course.create({
            data: {
                title: 'Python Programming Masterclass',
                description: 'Complete Python programming from basics to advanced',
                price: 149.99,
                thumbnailUrl: 'https://funix.edu.vn/wp-content/uploads/2022/12/funix-chuyen-doi-dinh-dang-tep-hinh-anh-bang-python-1.jpg',
                bannerUrl: 'https://www.shutterstock.com/image-illustration/3d-rendering-online-learning-banner-260nw-1636068757.jpg',
                instructorId: instructor2.id,
                categoryId: programmingCategory?.id,
                levelId: beginnerLevel?.id,
                isPublished: true,
                rating: 4.9,
                totalReviews: 1500,
                moneyBackGuarantee: true,
                videoHours: 55,
                articlesCount: 35,
                downloadableResources: 25,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'Comprehensive Python programming course from zero to hero',
                learningObjectives: 'Master Python programming, data structures, and algorithms',
                courseFeatures: 'Real-world projects, coding exercises, and assignments',
                requirements: 'No prior programming experience required',
            }
        });

        const financeCourse = await prisma.course.create({
            data: {
                title: 'Personal Finance Mastery',
                description: 'Master your personal finances and investment strategies',
                price: 79.99,
                thumbnailUrl: 'https://img.freepik.com/free-vector/finance-financial-performance-concept-illustration_53876-40450.jpg',
                bannerUrl: 'https://img.freepik.com/free-vector/finance-financial-performance-concept-illustration_53876-40450.jpg',
                instructorId: instructor3.id,
                categoryId: financeCategory?.id,
                levelId: beginnerLevel?.id,
                isPublished: true,
                rating: 4.7,
                totalReviews: 980,
                moneyBackGuarantee: true,
                videoHours: 25,
                articlesCount: 20,
                downloadableResources: 15,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'Learn to manage your money and invest wisely',
                learningObjectives: 'Understand personal finance, budgeting, and investment',
                courseFeatures: 'Financial planning tools, investment strategies, and case studies',
                requirements: 'Basic understanding of mathematics',
            }
        });

        const photographyCourse = await prisma.course.create({
            data: {
                title: 'Digital Photography Fundamentals',
                description: 'Master the art of digital photography',
                price: 89.99,
                thumbnailUrl: 'https://www.adorama.com/alc/wp-content/uploads/2021/04/photography-camera-learning-feature.jpg',
                bannerUrl: 'https://www.adorama.com/alc/wp-content/uploads/2021/04/photography-camera-learning-feature.jpg',
                instructorId: instructor2.id,
                categoryId: photographyCategory?.id,
                levelId: beginnerLevel?.id,
                isPublished: true,
                rating: 4.8,
                totalReviews: 750,
                moneyBackGuarantee: true,
                videoHours: 30,
                articlesCount: 25,
                downloadableResources: 40,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'Learn professional photography techniques',
                learningObjectives: 'Master camera settings, composition, and editing',
                courseFeatures: 'Practical assignments, photo editing tutorials, and equipment guides',
                requirements: 'Digital camera required (DSLR recommended)',
            }
        });

        const digitalMarketingCourse = await prisma.course.create({
            data: {
                title: 'Digital Marketing Strategy',
                description: 'Complete guide to digital marketing',
                price: 129.99,
                thumbnailUrl: 'https://www.simplilearn.com/ice9/free_resources_article_thumb/history_and_evolution_of_digital_marketing.jpg',
                bannerUrl: 'https://www.simplilearn.com/ice9/free_resources_article_thumb/history_and_evolution_of_digital_marketing.jpg',
                instructorId: instructor.id,
                categoryId: marketingCategory?.id,
                levelId: intermediateLevel?.id,
                isPublished: true,
                rating: 4.6,
                totalReviews: 890,
                moneyBackGuarantee: true,
                videoHours: 45,
                articlesCount: 30,
                downloadableResources: 25,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'Master modern digital marketing strategies',
                learningObjectives: 'Learn SEO, social media marketing, and paid advertising',
                courseFeatures: 'Real campaigns, analytics tools, and marketing templates',
                requirements: 'Basic marketing knowledge helpful but not required',
            }
        });

        // Thêm các khóa học khác cùng danh mục
        const additionalCourses = [
            {
                title: 'Social Media Marketing',
                description: 'Learn how to effectively market on social media platforms.',
                price: 99.99,
                thumbnailUrl: 'https://as2.ftcdn.net/jpg/01/02/55/57/1000_F_102555756_aFzCH91D99Mf06eyyOl7xcmgGT4il2lC.jpg',
                bannerUrl: 'https://as2.ftcdn.net/jpg/01/02/55/57/1000_F_102555756_aFzCH91D99Mf06eyyOl7xcmgGT4il2lC.jpg',
                instructorId: instructor.id,
                categoryId: marketingCategory?.id,
                levelId: beginnerLevel?.id,
                isPublished: true,
                rating: 4.5,
                totalReviews: 500,
                moneyBackGuarantee: true,
                videoHours: 30,
                articlesCount: 15,
                downloadableResources: 10,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'A comprehensive guide to social media marketing.',
                learningObjectives: 'Understand social media strategies and tools.',
                courseFeatures: 'Hands-on projects and case studies.',
                requirements: 'No prior knowledge required.',
            },
            {
                title: 'Content Marketing Mastery',
                description: 'Master the art of content marketing.',
                price: 89.99,
                thumbnailUrl: 'https://cdn.pixabay.com/photo/2020/12/09/03/10/digital-marketing-5816304_640.jpg',
                bannerUrl: 'https://cdn.pixabay.com/photo/2020/12/09/03/10/digital-marketing-5816304_640.jpg',
                instructorId: instructor.id,
                categoryId: marketingCategory?.id,
                levelId: intermediateLevel?.id,
                isPublished: true,
                rating: 4.7,
                totalReviews: 300,
                moneyBackGuarantee: true,
                videoHours: 40,
                articlesCount: 20,
                downloadableResources: 15,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'Learn how to create effective content marketing strategies.',
                learningObjectives: 'Develop skills in content creation and distribution.',
                courseFeatures: 'Real-world examples and templates.',
                requirements: 'Basic understanding of marketing principles.',
            },
            {
                title: 'SEO Fundamentals',
                description: 'Learn the basics of SEO and how to optimize your website.',
                price: 79.99,
                thumbnailUrl: 'https://www.searchenginejournal.com/wp-content/uploads/2024/02/image-seo-tips-791.jpg',
                bannerUrl: 'https://www.searchenginejournal.com/wp-content/uploads/2024/02/image-seo-tips-791.jpg',
                instructorId: instructor.id,
                categoryId: marketingCategory?.id,
                levelId: beginnerLevel?.id,
                isPublished: true,
                rating: 4.8,
                totalReviews: 400,
                moneyBackGuarantee: true,
                videoHours: 25,
                articlesCount: 10,
                downloadableResources: 5,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'A beginner\'s guide to SEO.',
                learningObjectives: 'Understand SEO principles and techniques.',
                courseFeatures: 'Practical exercises and case studies.',
                requirements: 'No prior knowledge required.',
            },
            {
                title: 'Email Marketing Essentials',
                description: 'Master the fundamentals of email marketing.',
                price: 69.99,
                thumbnailUrl: 'https://cdn.prod.website-files.com/5f3a33a074c2eb9e90f16437/67c2dc0d8c4c42f8502c8047_62569d69758af9648ecc3ca0_3.png',
                bannerUrl: 'https://cdn.prod.website-files.com/5f3a33a074c2eb9e90f16437/67c2dc0d8c4c42f8502c8047_62569d69758af9648ecc3ca0_3.png',
                instructorId: instructor.id,
                categoryId: marketingCategory?.id,
                levelId: beginnerLevel?.id,
                isPublished: true,
                rating: 4.4,
                totalReviews: 250,
                moneyBackGuarantee: true,
                videoHours: 20,
                articlesCount: 8,
                downloadableResources: 3,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'Learn how to create effective email marketing campaigns.',
                learningObjectives: 'Understand email marketing strategies and tools.',
                courseFeatures: 'Templates and real-world examples.',
                requirements: 'Basic understanding of marketing principles.',
            },
            {
                title: 'Advanced Google Analytics',
                description: 'Dive deep into Google Analytics and learn advanced techniques.',
                price: 149.99,
                thumbnailUrl: 'https://s3-sgn09.fptcloud.com/codelearnstorage/Media/Default/Users/nguyenthaihoankitob_40gmail_2Ecom/google-analytics/google-analytics-phan-1-anh-0.jpg',
                bannerUrl: 'https://s3-sgn09.fptcloud.com/codelearnstorage/Media/Default/Users/nguyenthaihoankitob_40gmail_2Ecom/google-analytics/google-analytics-phan-1-anh-0.jpg',
                instructorId: instructor.id,
                categoryId: marketingCategory?.id,
                levelId: intermediateLevel?.id,
                isPublished: true,
                rating: 4.9,
                totalReviews: 600,
                moneyBackGuarantee: true,
                videoHours: 50,
                articlesCount: 25,
                downloadableResources: 20,
                lifetimeAccess: true,
                certificate: true,
                courseOverview: 'Master Google Analytics for data-driven decisions.',
                learningObjectives: 'Learn to analyze and interpret data.',
                courseFeatures: 'Hands-on projects and case studies.',
                requirements: 'Basic knowledge of Google Analytics recommended.',
            }
        ];

        // Tạo các khóa học bổ sung
        for (const courseData of additionalCourses) {
            await prisma.course.create({
                data: courseData,
            });
        }

        // Combine all courses
        const allCourses = [
            dataAnalysisCourse, 
            excelCourse, 
            businessLawCourse, 
            agileCourse,
            pythonCourse,
            financeCourse,
            photographyCourse,
            digitalMarketingCourse
        ];

        // Create lessons and videos for each course
        for (const course of allCourses) {
            // Create more detailed lessons
            const lessonTitles = getLessonTitles(course.title);
            await prisma.lesson.createMany({
                data: lessonTitles.map((title, index) => ({
                    courseId: course.id,
                    title: title,
                    content: `Detailed content for ${title}`,
                    order: index + 1
                }))
            });

            // Add videos for each lesson
            const lessons = await prisma.lesson.findMany({
                where: { courseId: course.id }
            });

            for (const lesson of lessons) {
                await prisma.video.create({
                    data: {
                        lessonId: lesson.id,
                        courseId: course.id,
                        title: `${lesson.title} Video`,
                        videoUrl: 'http://localhost:4000/static/video-stream/405d8e0b-b665-4067-8c6f-453aa338e65e.mp4',
                        duration: 1800 + Math.floor(Math.random() * 1800), // 30-60 minutes
                        orderLesson: lesson.order
                    }
                });
            }

            // Add comprehensive FAQs
            await prisma.faq.createMany({
                data: getCourseFAQs(course.id)
            });

            // Add reviews
            const reviewers = [user1, user2, instructor, instructor2];
            const reviews = generateReviews(course.id, reviewers);
            await prisma.review.createMany({
                data: reviews
            });
        }

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
}

// Helper function to generate lesson titles based on course
function getLessonTitles(courseTitle: string): string[] {
    const commonLessons = [
        'Course Introduction and Overview',
        'Getting Started with Tools and Setup',
        'Understanding Core Concepts',
        'Basic Principles and Fundamentals',
        'Advanced Techniques and Strategies',
        'Real-world Applications',
        'Best Practices and Tips',
        'Case Studies and Examples',
        'Practical Exercises and Projects',
        'Course Summary and Next Steps'
    ];

    return commonLessons;
}

// Helper function to generate course FAQs
function getCourseFAQs(courseId: string) {
    return [
        {
            courseId,
            question: 'How long do I have access to the course?',
            answer: 'You have lifetime access to this course, including all future updates.'
        },
        {
            courseId,
            question: 'Is there a certificate upon completion?',
            answer: 'Yes, you will receive a verifiable certificate of completion once you finish the course.'
        },
        {
            courseId,
            question: 'What if I am not satisfied with the course?',
            answer: 'We offer a 30-day money-back guarantee if you are not satisfied with the course content.'
        },
        {
            courseId,
            question: 'Do I need any prerequisites for this course?',
            answer: 'The course is designed to accommodate both beginners and intermediate learners. Basic computer skills are recommended.'
        },
        {
            courseId,
            question: 'Is there instructor support available?',
            answer: 'Yes, you can ask questions in the course discussion forum and get responses from instructors and fellow students.'
        }
    ];
}

// Helper function to generate reviews
function generateReviews(courseId: string, users: any[]) {
    const reviews: { userId: string; courseId: string; rating: number; comment: string }[] = [];
    const comments = [
        'Excellent course! Very comprehensive and well-structured.',
        'Great content and practical examples. Highly recommended!',
        'The instructor explains complex concepts in a simple way.',
        'Very informative and practical. Worth every penny!',
        'Amazing course with lots of hands-on exercises.'
    ];

    for (const user of users) {
        if (Math.random() > 0.3) { // 70% chance to add a review
            reviews.push({
                userId: user.id,
                courseId: courseId,
                rating: Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
                comment: comments[Math.floor(Math.random() * comments.length)]
            });
        }
    }

    return reviews;
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
