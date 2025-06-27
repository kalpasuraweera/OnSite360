import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name, permissions = [] } = createRoleDto;

    // Create role
    return this.prisma.role.create({
      data: {
        name,
        rolePermissions: {
          create: permissions.map((permission) => ({
            permission: {
              connect: { id: permission.permissionId },
            },
            level: permission.level || 0, // Default level to 0 if not provided
            availableComponents: permission.availableComponents || [], // Default to empty array if not provided
          })),
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { name, permissions = [] } = updateRoleDto;
    // Update role and its permissions
    return this.prisma.role.update({
      where: { id },
      data: {
        name,
        rolePermissions: {
          upsert: permissions.map((permission) => ({
            where: {
              roleId_permissionId: {
                roleId: id,
                permissionId: permission.permissionId,
              },
            },
            update: {
              level: permission.level || 0, // Default level to 0 if not provided
              availableComponents: permission.availableComponents || [], // Default to empty array if not provided
            },
            create: {
              permissionId: permission.permissionId,
              level: permission.level || 0, // Default level to 0 if not provided
              availableComponents: permission.availableComponents || [], // Default to empty array if not provided
            },
          })),
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Delete role and its associated permissions in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Check if any users are assigned to this role
      const usersWithRole = await prisma.user.count({
        where: { roleId: id },
      });

      if (usersWithRole > 0) {
        throw new Error(
          `Cannot delete role. ${usersWithRole} user(s) are assigned to this role. Please reassign users before deleting the role.`,
        );
      }

      // First delete all role permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Then delete the role
      return prisma.role.delete({
        where: { id },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });
  }

  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
    level: number,
  ) {
    return this.prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
      update: {
        level,
      },
      create: {
        roleId,
        permissionId,
        level,
      },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }
}
