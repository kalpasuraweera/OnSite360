import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@onsite360.com' },
    update: {},
    create: {
      email: 'admin@onsite360.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  // Add sample project
  await prisma.project.upsert({
    where: { projectId: 'sample-project-1' },
    update: {},
    create: {
      projectId: 'sample-project-1',
      name: 'Sample Construction Project',
      description: 'A demonstration project for OnSite360',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('Database has been seeded!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
