import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create permissions data from the provided JSON
  const permissionsData = [
    {
      pageId: 'dashboard',
      pageName: 'Dashboard',
    },
    {
      pageId: 'user-management',
      pageName: 'User Management',
    },
    {
      pageId: 'role-management',
      pageName: 'Role Management',
    },
    {
      pageId: 'permission-management',
      pageName: 'Permission Management',
    },
  ];

  // Create permissions in the database
  for (const permission of permissionsData) {
    const createdPermission = await prisma.permission.create({
      data: {
        pageId: permission.pageId,
        pageName: permission.pageName,
      },
    });
    console.log(`Created permission for page: ${createdPermission.pageName}`);
  }

  // Create system admin role
  const adminRole = await prisma.role.create({
    data: {
      name: 'System Admin',
    },
  });

  // Get all permissions
  const allPermissions = await prisma.permission.findMany();

  // Create RolePermission entries for each permission (with admin level access)
  for (const permission of allPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
        level: 3, // Admin level access
      },
    });
  }

  console.log(`Created role: ${adminRole.name}`);

  // Create a system admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@onsite360.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: {
        connect: { id: adminRole.id },
      },
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // Create a sample project
  const project = await prisma.project.create({
    data: {
      name: 'Sample Project',
      description: 'This is a sample project for demonstration purposes.',
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
    },
  });
  console.log(`Created project: ${project.name}`);
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
