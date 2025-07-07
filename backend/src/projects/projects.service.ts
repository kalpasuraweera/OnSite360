import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Project, UserProject } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignUserToProjectDto } from './dto/assign-user-to-project.dto';
import { UpdateUserProjectDto } from './dto/update-user-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // Create a new project
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const { manager, ...projectData } = createProjectDto;

    return this.prisma.project.create({
      data: {
        ...projectData,
        startDate: projectData.startDate
          ? new Date(projectData.startDate)
          : undefined,
        endDate: projectData.endDate
          ? new Date(projectData.endDate)
          : undefined,
        coordinates: projectData.coordinates || undefined,
        userProjects: manager
          ? {
              create: {
                userId: manager,
                projectRole: 'Project Manager',
                accessLevel: 3, // Admin level
                isActive: true,
              },
            }
          : undefined,
      },
      include: {
        userProjects: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Get all projects
  async findAll(): Promise<Project[]> {
    return this.prisma.project.findMany({
      include: {
        userProjects: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
            threads: true,
            Issue: true,
          },
        },
      },
    });
  }

  // Get a single project by ID
  async findOne(id: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        userProjects: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        documents: true,
        threads: {
          include: {
            _count: {
              select: {
                messages: true,
              },
            },
          },
        },
        Issue: {
          include: {
            reporter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
            threads: true,
            Issue: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  // Update a project
  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    const { manager, ...projectData } = updateProjectDto;

    // Check if project exists
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const updateData = {
      ...projectData,
      startDate: projectData.startDate
        ? new Date(projectData.startDate)
        : undefined,
      endDate: projectData.endDate ? new Date(projectData.endDate) : undefined,
      coordinates: projectData.coordinates || undefined,
    };

    // If manager is provided, handle manager assignment separately
    if (manager) {
      // Check if manager exists
      const managerUser = await this.prisma.user.findUnique({
        where: { id: manager },
      });

      if (!managerUser) {
        throw new NotFoundException(`User with ID ${manager} not found`);
      }

      // Check if manager is already assigned to this project
      const existingAssignment = await this.prisma.userProject.findUnique({
        where: {
          userId_projectId: {
            userId: manager,
            projectId: id,
          },
        },
      });

      if (!existingAssignment) {
        // Assign manager to project
        await this.prisma.userProject.create({
          data: {
            userId: manager,
            projectId: id,
            projectRole: 'Project Manager',
            accessLevel: 3, // Admin level
            isActive: true,
          },
        });
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        userProjects: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Delete a project
  async remove(id: string): Promise<Project> {
    // Check if project exists
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }

  // Assign a user to a project
  async assignUserToProject(
    projectId: string,
    assignUserDto: AssignUserToProjectDto,
  ): Promise<UserProject> {
    const { userId, ...assignmentData } = assignUserDto;

    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user is already assigned to this project
    const existingAssignment = await this.prisma.userProject.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        `User ${userId} is already assigned to project ${projectId}`,
      );
    }

    return this.prisma.userProject.create({
      data: {
        userId,
        projectId,
        projectRole: assignmentData.projectRole || 'Worker',
        accessLevel: assignmentData.accessLevel || 1,
        workSchedule: assignmentData.workSchedule,
        hourlyRate: assignmentData.hourlyRate,
        emergencyContact: assignmentData.emergencyContact,
        notes: assignmentData.notes,
        endDate: assignmentData.endDate
          ? new Date(assignmentData.endDate)
          : undefined,
        isActive:
          assignmentData.isActive !== undefined
            ? assignmentData.isActive
            : true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  // Update user project assignment
  async updateUserProjectAssignment(
    projectId: string,
    userId: string,
    updateUserProjectDto: UpdateUserProjectDto,
  ): Promise<UserProject> {
    // Check if assignment exists
    const existingAssignment = await this.prisma.userProject.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException(
        `User ${userId} is not assigned to project ${projectId}`,
      );
    }

    return this.prisma.userProject.update({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      data: {
        ...updateUserProjectDto,
        endDate: updateUserProjectDto.endDate
          ? new Date(updateUserProjectDto.endDate)
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
  }

  // Remove user from project
  async removeUserFromProject(
    projectId: string,
    userId: string,
  ): Promise<UserProject> {
    // Check if assignment exists
    const existingAssignment = await this.prisma.userProject.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!existingAssignment) {
      throw new NotFoundException(
        `User ${userId} is not assigned to project ${projectId}`,
      );
    }

    return this.prisma.userProject.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  }

  // Get all users assigned to a project
  async getProjectUsers(projectId: string): Promise<UserProject[]> {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.prisma.userProject.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  // Get all projects for a user
  async getUserProjects(userId: string): Promise<UserProject[]> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.userProject.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            budget: true,
            location: true,
            startDate: true,
            endDate: true,
            logoUrl: true,
            featuredImageUrl: true,
          },
        },
      },
    });
  }

  // Get project statistics
  async getProjectStatistics(projectId: string) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      totalDocuments,
      totalThreads,
      totalIssues,
      openIssues,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      this.prisma.task.count({ where: { projectId } }),
      this.prisma.task.count({ where: { projectId, status: 'Completed' } }),
      this.prisma.task.count({ where: { projectId, status: 'In Progress' } }),
      this.prisma.document.count({ where: { projectId } }),
      this.prisma.thread.count({ where: { projectId } }),
      this.prisma.issue.count({ where: { projectId } }),
      this.prisma.issue.count({ where: { projectId, status: 'Open' } }),
      this.prisma.userProject.count({ where: { projectId } }),
      this.prisma.userProject.count({ where: { projectId, isActive: true } }),
    ]);

    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        pending: totalTasks - completedTasks - inProgressTasks,
        completionRate:
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      },
      documents: {
        total: totalDocuments,
      },
      threads: {
        total: totalThreads,
      },
      issues: {
        total: totalIssues,
        open: openIssues,
        resolved: totalIssues - openIssues,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
    };
  }
}
