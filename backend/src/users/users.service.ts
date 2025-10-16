import { Injectable } from '@nestjs/common';
import { User, Notification } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(user: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Hash password before storing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    return this.prisma.user.create({
      omit: {
        password: true,
      },
      data: {
        email: user.email,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        role: {
          connect: {
            id: user.roleId,
          },
        },
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(email: string): Promise<Omit<User, 'password'> | null> {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
      omit: {
        password: true,
      },
    });
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.prisma.user.findMany({
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
      omit: {
        password: true,
      },
    });
  }

  async findById(id: string): Promise<Omit<User, 'password'> | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
      omit: {
        password: true,
      },
    });
    return user || undefined;
  }

  async update(
    id: string,
    updateUserDto: Partial<CreateUserDto>,
  ): Promise<Omit<User, 'password'>> {
    // Hash password if it's being updated
    const data = { ...updateUserDto };
    if (data.password) {
      const saltRounds = 10;
      data.password = await bcrypt.hash(data.password, saltRounds);
    }

    return this.prisma.user.update({
      where: {
        id,
      },
      data,
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
      omit: {
        password: true,
      },
    });
  }

  async remove(id: string): Promise<Omit<User, 'password'>> {
    return this.prisma.user.delete({
      where: {
        id,
      },
      omit: {
        password: true,
      },
    });
  }

  async validateUserPassword(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    // Get the complete user with password for comparison
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Check if user exists and password matches
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    // Return user without the password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserProjects(userId: string) {
    const userProjects = await this.prisma.userProject.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        project: {
          include: {
            _count: {
              select: {
                tasks: true,
                documents: true,
                threads: true,
                issue: true,
              },
            },
          },
        },
      },
    });

    return userProjects.map((userProject) => ({
      ...userProject.project,
      userProject: {
        id: userProject.id,
        projectRole: userProject.projectRole,
        accessLevel: userProject.accessLevel,
        assignedDate: userProject.assignedDate,
        isActive: userProject.isActive,
      },
    }));
  }

  // New: fetch notifications for a given user, most recent first
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { time: 'desc' },
    });
  }

  // New: mark a user's notification as read (verifies ownership)
  async markNotificationRead(
    userId: string,
    notificationId: string,
  ): Promise<Notification | null> {
    // Ensure the notification belongs to the user
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.userId !== userId) {
      return null;
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, updatedAt: new Date() },
    });
  }
}
