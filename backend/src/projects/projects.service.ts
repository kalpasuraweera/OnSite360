import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Project,
  UserProject,
  CrewMember,
  ProjectAttendance,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignUserToProjectDto } from './dto/assign-user-to-project.dto';
import { UpdateUserProjectDto } from './dto/update-user-project.dto';
import { CreateCrewMemberDto } from './dto/create-crew-member.dto';
import { UpdateCrewMemberDto } from './dto/update-crew-member.dto';
import { CreateProjectAttendanceDto } from './dto/create-project-attendance.dto';
import { UpdateProjectAttendanceDto } from './dto/update-project-attendance.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // Create a new project
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const { users, ...projectData } = createProjectDto;

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
        userProjects:
          users && users.length > 0
            ? {
                create: users.map((user) => ({
                  userId: user.userId,
                  projectRole: user.projectRole || 'Worker',
                  accessLevel: user.accessLevel || 1,
                  isActive: true,
                })),
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
            issue: true,
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
        issue: {
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
            issue: true,
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
    const { users, ...projectData } = updateProjectDto;

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

    // Update the project first
    await this.prisma.project.update({
      where: { id },
      data: updateData,
    });

    // If users are provided, handle user assignments
    if (users && users.length > 0) {
      // Validate all users exist
      const userIds = users.map((u) => u.userId);
      const existingUsers = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true },
      });

      const existingUserIds = existingUsers.map((u) => u.id);
      const missingUsers = userIds.filter(
        (id) => !existingUserIds.includes(id),
      );

      if (missingUsers.length > 0) {
        throw new NotFoundException(
          `Users with IDs ${missingUsers.join(', ')} not found`,
        );
      }

      // Create user assignments for users not already assigned
      for (const user of users) {
        const existingAssignment = await this.prisma.userProject.findUnique({
          where: {
            userId_projectId: {
              userId: user.userId,
              projectId: id,
            },
          },
        });

        if (!existingAssignment) {
          await this.prisma.userProject.create({
            data: {
              userId: user.userId,
              projectId: id,
              projectRole: user.projectRole || 'Worker',
              accessLevel: user.accessLevel || 1,
              isActive: true,
            },
          });
        }
      }
    }

    const result = await this.prisma.project.findUnique({
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
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return result;
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

  // Crew Member Management
  async createCrewMember(
    createCrewMemberDto: CreateCrewMemberDto,
  ): Promise<CrewMember> {
    return this.prisma.crewMember.create({
      data: {
        ...createCrewMemberDto,
        hireDate: createCrewMemberDto.hireDate
          ? new Date(createCrewMemberDto.hireDate)
          : undefined,
      },
    });
  }

  async getCrewMembers(): Promise<CrewMember[]> {
    return this.prisma.crewMember.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getCrewMember(id: string): Promise<CrewMember> {
    const crewMember = await this.prisma.crewMember.findUnique({
      where: { id },
    });

    if (!crewMember) {
      throw new NotFoundException(`Crew member with ID ${id} not found`);
    }

    return crewMember;
  }

  async updateCrewMember(
    id: string,
    updateCrewMemberDto: UpdateCrewMemberDto,
  ): Promise<CrewMember> {
    const existingCrewMember = await this.prisma.crewMember.findUnique({
      where: { id },
    });

    if (!existingCrewMember) {
      throw new NotFoundException(`Crew member with ID ${id} not found`);
    }

    return this.prisma.crewMember.update({
      where: { id },
      data: {
        ...updateCrewMemberDto,
        hireDate: updateCrewMemberDto.hireDate
          ? new Date(updateCrewMemberDto.hireDate)
          : undefined,
      },
    });
  }

  async deleteCrewMember(id: string): Promise<CrewMember> {
    const existingCrewMember = await this.prisma.crewMember.findUnique({
      where: { id },
    });

    if (!existingCrewMember) {
      throw new NotFoundException(`Crew member with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    return this.prisma.crewMember.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Project Crew Assignment
  async assignCrewMemberToProject(
    projectId: string,
    crewMemberId: string,
    notes?: string,
  ) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if crew member exists
    const crewMember = await this.prisma.crewMember.findUnique({
      where: { id: crewMemberId },
    });

    if (!crewMember) {
      throw new NotFoundException(
        `Crew member with ID ${crewMemberId} not found`,
      );
    }

    // Check if already assigned
    const existingAssignment = await this.prisma.crewAssignment.findUnique({
      where: {
        projectId_crewMemberId: {
          projectId,
          crewMemberId,
        },
      },
    });

    if (existingAssignment && existingAssignment.isActive) {
      throw new BadRequestException(
        `Crew member ${crewMemberId} is already assigned to project ${projectId}`,
      );
    }

    return this.prisma.crewAssignment.create({
      data: {
        projectId,
        crewMemberId,
        notes,
        isActive: true,
      },
      include: {
        crewMember: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async removeCrewMemberFromProject(projectId: string, crewMemberId: string) {
    const existingAssignment = await this.prisma.crewAssignment.findUnique({
      where: {
        projectId_crewMemberId: {
          projectId,
          crewMemberId,
        },
      },
    });

    if (!existingAssignment || !existingAssignment.isActive) {
      throw new NotFoundException(
        `Crew member ${crewMemberId} is not assigned to project ${projectId}`,
      );
    }

    return this.prisma.crewAssignment.update({
      where: {
        projectId_crewMemberId: {
          projectId,
          crewMemberId,
        },
      },
      data: {
        isActive: false,
        endDate: new Date(),
      },
    });
  }

  async getProjectCrewMembers(projectId: string) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.prisma.crewAssignment.findMany({
      where: { projectId, isActive: true },
      include: {
        crewMember: true,
      },
      orderBy: {
        crewMember: {
          name: 'asc',
        },
      },
    });
  }

  // Project Attendance Management
  async createProjectAttendance(
    projectId: string,
    userId: string,
    createAttendanceDto: CreateProjectAttendanceDto,
  ): Promise<ProjectAttendance> {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if attendance for this date already exists
    const existingAttendance = await this.prisma.projectAttendance.findUnique({
      where: {
        projectId_date: {
          projectId,
          date: new Date(createAttendanceDto.date),
        },
      },
    });

    if (existingAttendance) {
      throw new BadRequestException(
        `Attendance for ${createAttendanceDto.date} already exists for this project`,
      );
    }

    return this.prisma.projectAttendance.create({
      data: {
        projectId,
        date: new Date(createAttendanceDto.date),
        actualStartTime: createAttendanceDto.actualStartTime
          ? new Date(createAttendanceDto.actualStartTime)
          : undefined,
        workDelayed: createAttendanceDto.workDelayed ?? false,
        delayReason: createAttendanceDto.delayReason,
        delayDuration: createAttendanceDto.delayDuration,
        dayType: createAttendanceDto.dayType ?? 'WORKDAY',
        dayTypeReason: createAttendanceDto.dayTypeReason,
        isWorkDay: createAttendanceDto.isWorkDay ?? true,
        notes: createAttendanceDto.notes,
        markedById: userId,
      },
      include: {
        markedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        crewAttendance: {
          include: {
            crewMember: true,
          },
        },
      },
    });
  }

  async markAttendance(
    projectId: string,
    date: string,
    userId: string,
    markAttendanceDto: MarkAttendanceDto,
  ) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if project attendance exists for this date
    let projectAttendance = await this.prisma.projectAttendance.findUnique({
      where: {
        projectId_date: {
          projectId,
          date: new Date(date),
        },
      },
    });

    // Create project attendance if it doesn't exist
    if (!projectAttendance) {
      projectAttendance = await this.prisma.projectAttendance.create({
        data: {
          projectId,
          date: new Date(date),
          markedById: userId,
        },
      });
    }

    // Validate all crew members exist and are assigned to the project
    const crewMemberIds = markAttendanceDto.crewAttendance.map(
      (record) => record.crewMemberId,
    );

    const assignedCrewMembers = await this.prisma.crewAssignment.findMany({
      where: {
        projectId,
        crewMemberId: { in: crewMemberIds },
        isActive: true,
      },
      include: {
        crewMember: true,
      },
    });

    const assignedCrewMemberIds = assignedCrewMembers.map(
      (assignment) => assignment.crewMemberId,
    );

    const unassignedCrewMembers = crewMemberIds.filter(
      (id) => !assignedCrewMemberIds.includes(id),
    );

    if (unassignedCrewMembers.length > 0) {
      throw new BadRequestException(
        `Crew members ${unassignedCrewMembers.join(', ')} are not assigned to this project`,
      );
    }

    // Delete existing attendance records for this date to allow updates
    await this.prisma.attendanceRecord.deleteMany({
      where: { projectAttendanceId: projectAttendance.id },
    });

    // Create new attendance records
    const attendanceRecords = await Promise.all(
      markAttendanceDto.crewAttendance.map((record) =>
        this.prisma.attendanceRecord.create({
          data: {
            projectAttendanceId: projectAttendance.id,
            crewMemberId: record.crewMemberId,
            status: record.status,
            checkInTime: record.checkInTime
              ? new Date(record.checkInTime)
              : undefined,
            checkOutTime: record.checkOutTime
              ? new Date(record.checkOutTime)
              : undefined,
            breakDuration: record.breakDuration,
            totalHours: record.totalHours,
            scheduledHours: record.scheduledHours,
            leaveType: record.leaveType,
            isApproved: record.isApproved,
            workLocation: record.workLocation,
            tasks: record.tasks,
            notes: record.notes,
          },
          include: {
            crewMember: true,
          },
        }),
      ),
    );

    return {
      projectAttendance,
      attendanceRecords,
    };
  }

  async getProjectAttendanceByDate(projectId: string, date: string) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const attendance = await this.prisma.projectAttendance.findUnique({
      where: {
        projectId_date: {
          projectId,
          date: new Date(date),
        },
      },
      include: {
        markedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        crewAttendance: {
          include: {
            crewMember: true,
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException(
        `Attendance for ${date} not found for project ${projectId}`,
      );
    }

    return attendance;
  }

  async getProjectAttendanceHistory(
    projectId: string,
    startDate?: string,
    endDate?: string,
  ) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const whereClause: {
      projectId: string;
      date?: {
        gte?: Date;
        lte?: Date;
      };
    } = { projectId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    return this.prisma.projectAttendance.findMany({
      where: whereClause,
      include: {
        markedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        crewAttendance: {
          include: {
            crewMember: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async updateProjectAttendance(
    projectId: string,
    date: string,
    updateAttendanceDto: UpdateProjectAttendanceDto,
  ) {
    const existingAttendance = await this.prisma.projectAttendance.findUnique({
      where: {
        projectId_date: {
          projectId,
          date: new Date(date),
        },
      },
    });

    if (!existingAttendance) {
      throw new NotFoundException(
        `Attendance for ${date} not found for project ${projectId}`,
      );
    }

    return this.prisma.projectAttendance.update({
      where: {
        projectId_date: {
          projectId,
          date: new Date(date),
        },
      },
      data: {
        actualStartTime: updateAttendanceDto.actualStartTime
          ? new Date(updateAttendanceDto.actualStartTime)
          : undefined,
        workDelayed: updateAttendanceDto.workDelayed,
        delayReason: updateAttendanceDto.delayReason,
        delayDuration: updateAttendanceDto.delayDuration,
        dayType: updateAttendanceDto.dayType,
        dayTypeReason: updateAttendanceDto.dayTypeReason,
        isWorkDay: updateAttendanceDto.isWorkDay,
        notes: updateAttendanceDto.notes,
      },
      include: {
        markedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        crewAttendance: {
          include: {
            crewMember: true,
          },
        },
      },
    });
  }

  async deleteProjectAttendance(projectId: string, date: string) {
    const existingAttendance = await this.prisma.projectAttendance.findUnique({
      where: {
        projectId_date: {
          projectId,
          date: new Date(date),
        },
      },
    });

    if (!existingAttendance) {
      throw new NotFoundException(
        `Attendance for ${date} not found for project ${projectId}`,
      );
    }

    return this.prisma.projectAttendance.delete({
      where: {
        projectId_date: {
          projectId,
          date: new Date(date),
        },
      },
    });
  }
}
