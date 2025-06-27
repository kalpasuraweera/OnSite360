import { Injectable } from '@nestjs/common';
import { Permission, RolePermission, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  // Get all permissions
  async getAllPermissions(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  // Get permission by ID
  async getPermissionById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  // Create a new permission
  async createPermission(
    data: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Permission> {
    return this.prisma.permission.create({ data });
  }

  // Update a permission
  async updatePermission(
    id: string,
    data: Partial<Permission>,
  ): Promise<Permission> {
    return this.prisma.permission.update({ where: { id }, data });
  }

  // Delete a permission
  async deletePermission(id: string): Promise<Permission> {
    return this.prisma.permission.delete({ where: { id } });
  }

  // Get all permissions for a role
  async getPermissionsByRole(roleId: string): Promise<RolePermission[]> {
    return this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
  }

  // Assign a permission to a role
  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
    level: number = 0,
  ): Promise<RolePermission> {
    return this.prisma.rolePermission.create({
      data: { roleId, permissionId, level },
    });
  }

  // Update permission level for a role-permission
  async updateRolePermissionLevel(
    roleId: string,
    permissionId: string,
    level: number,
  ): Promise<RolePermission> {
    return this.prisma.rolePermission.update({
      where: { roleId_permissionId: { roleId, permissionId } },
      data: { level },
    });
  }

  // Remove a permission from a role
  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission> {
    return this.prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }
}
