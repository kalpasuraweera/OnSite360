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
      components: [
        {
          component_id: 'view-progress',
          component_name: 'View Progress',
        },
        {
          component_id: 'view-costs',
          component_name: 'View Costs',
        },
        {
          component_id: 'view-safety',
          component_name: 'View Safety Metrics',
        },
      ],
    },
    {
      pageId: 'document-management',
      pageName: 'Document Management',

      components: [
        {
          component_id: 'upload-document',
          component_name: 'Upload Document',
        },
        {
          component_id: 'view-document',
          component_name: 'View Document',
        },
        {
          component_id: 'edit-document',
          component_name: 'Edit Document',
        },
        {
          component_id: 'delete-document',
          component_name: 'Delete Document',
        },
      ],
    },
    {
      pageId: 'task-management',
      pageName: 'Task Management',

      components: [
        {
          component_id: 'create-task',
          component_name: 'Create Task',
        },
        {
          component_id: 'view-task',
          component_name: 'View Task',
        },
        {
          component_id: 'edit-task',
          component_name: 'Edit Task',
        },
        {
          component_id: 'assign-task',
          component_name: 'Assign Task',
        },
        {
          component_id: 'set-reminder',
          component_name: 'Set Reminder',
        },
      ],
    },
    {
      pageId: 'communication',
      pageName: 'Communication',

      components: [
        {
          component_id: 'send-message',
          component_name: 'Send Message',
        },
        {
          component_id: 'view-message',
          component_name: 'View Message',
        },
        {
          component_id: 'attach-file',
          component_name: 'Attach File',
        },
      ],
    },
    {
      pageId: 'schedule-management',
      pageName: 'Schedule Management',

      components: [
        {
          component_id: 'create-schedule',
          component_name: 'Create Schedule',
        },
        {
          component_id: 'view-schedule',
          component_name: 'View Schedule',
        },
        {
          component_id: 'edit-schedule',
          component_name: 'Edit Schedule',
        },
      ],
    },
    {
      pageId: 'issue-tracking',
      pageName: 'Issue Tracking',

      components: [
        {
          component_id: 'create-rfi',
          component_name: 'Create RFI',
        },
        {
          component_id: 'view-rfi',
          component_name: 'View RFI',
        },
        {
          component_id: 'resolve-rfi',
          component_name: 'Resolve RFI',
        },
      ],
    },
    {
      pageId: 'progress-tracking',
      pageName: 'Progress Tracking',

      components: [
        {
          component_id: 'view-progress-report',
          component_name: 'View Progress Report',
        },
        {
          component_id: 'generate-report',
          component_name: 'Generate Report',
        },
      ],
    },
    {
      pageId: 'user-management',
      pageName: 'User Management',

      components: [
        {
          component_id: 'add-user',
          component_name: 'Add User',
        },
        {
          component_id: 'view-user',
          component_name: 'View User',
        },
        {
          component_id: 'edit-user',
          component_name: 'Edit User',
        },
        {
          component_id: 'delete-user',
          component_name: 'Delete User',
        },
        {
          component_id: 'assign-permissions',
          component_name: 'Assign Permissions',
        },
      ],
    },
  ];

  // Create permissions in the database
  for (const permission of permissionsData) {
    const createdPermission = await prisma.permission.create({
      data: {
        pageId: permission.pageId,
        pageName: permission.pageName,
        components: {
          create: permission.components.map((component) => ({
            componentId: component.component_id,
            componentName: component.component_name,
          })),
        },
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
  const hashedPassword = await bcrypt.hash('admin@123', 10);
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
