const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSystemB() {
    console.log('🔄 Updating System B (Profiles Table) with plain-text passwords...');

    try {
        const users = [
            {
                id: '00000000-0000-4000-a000-000000000001',
                email: 'admin.test@company.com',
                name: 'Test Admin',
                role: 'admin',
                password: 'Hiro@123456'
            },
            {
                id: '00000000-0000-4000-a000-000000000002',
                email: 'recruiter.test@company.com',
                name: 'John Recruiter',
                role: 'recruiter',
                password: 'Rec@123456'
            },
            {
                id: 'd6fc37b0-ef6a-4206-9dde-1da3dd77550a', // Use the ID from your previous request
                email: 'sane.alam@wildnetedge.com',
                name: 'Sane Aalam',
                role: 'admin',
                password: 'Sane@1234'
            }
        ];

        for (const user of users) {
          await prisma.profile.upsert({
              where: { email: user.email },
              update: { 
                name: user.name, 
                role: user.role, 
                password: user.password 
              },
              create: user
          });
        }

        console.log('✅ System B Updated successfully!');
        
    } catch (error) {
        console.error('❌ Error updating profiles:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateSystemB();
