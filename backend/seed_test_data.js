const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Seeding test data with PLAIN PASSWORDS...');

    try {
        // 1. Create Admin
        const adminId = '00000000-0000-4000-a000-000000000001';
        
        await prisma.profile.upsert({
            where: { email: 'admin.test@company.com' },
            update: { password: 'Hiro@123456' },
            create: {
                id: adminId,
                email: 'admin.test@company.com',
                name: 'Test Admin',
                role: 'admin',
                password: 'Hiro@123456'
            }
        });

        // 2. Create Recruiter
        const recId = '00000000-0000-4000-a000-000000000002';
        
        await prisma.profile.upsert({
            where: { email: 'recruiter.test@company.com' },
            update: { password: 'Rec@123456' },
            create: {
                id: recId,
                email: 'recruiter.test@company.com',
                name: 'John Recruiter',
                role: 'recruiter',
                password: 'Rec@123456'
            }
        });

        console.log('✅ Successfully inserted dummy profiles with plain passwords!');
        
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
