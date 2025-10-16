import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: createTaskDto.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const data: {
      title: string;
      description?: string;
      projectId: string;
      assigneeId?: string;
      status: string;
      priority: string;
      progress: number;
      estimatedHours?: number;
      actualHours?: number;
      tags: string[];
      dueDate?: Date;
      startedAt?: Date;
      completedAt?: Date;
      projectPhaseId?: string;
    } = {
      title: createTaskDto.title,
      description: createTaskDto.description,
      projectId: createTaskDto.projectId,
      assigneeId: createTaskDto.assigneeId,
      status: createTaskDto.status || 'Pending',
      priority: createTaskDto.priority || 'Medium',
      progress: createTaskDto.progress || 0,
      estimatedHours: createTaskDto.estimatedHours,
      actualHours: createTaskDto.actualHours,
      tags: createTaskDto.tags || [],
    };

    if (createTaskDto.dueDate) {
      data.dueDate = new Date(createTaskDto.dueDate);
    }
    if (createTaskDto.startedAt) {
      data.startedAt = new Date(createTaskDto.startedAt);
    }
    if (createTaskDto.completedAt) {
      data.completedAt = new Date(createTaskDto.completedAt);
    }

    // NEW: validate projectPhaseId if provided and persist to data
    if (createTaskDto.projectPhaseId) {
      const phase = await this.prisma.projectPhase.findUnique({
        where: { id: createTaskDto.projectPhaseId },
      });
      if (!phase) {
        throw new NotFoundException('Project phase not found');
      }
      if (phase.projectId !== createTaskDto.projectId) {
        throw new ForbiddenException(
          'Project phase does not belong to this project',
        );
      }
      data.projectPhaseId = createTaskDto.projectPhaseId;
    }

    const task = await this.prisma.task.create({
      data,
      include: {
        project: { select: { id: true, name: true } },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        attachments: {
          select: { id: true, name: true, url: true, type: true },
        },
        comments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        // NEW: include project phase details
        projectPhase: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            order: true,
          },
        },
      },
    });

    // Connect attachments if provided
    if (createTaskDto.attachments && createTaskDto.attachments.length > 0) {
      await this.prisma.task.update({
        where: { id: task.id },
        data: {
          attachments: {
            connect: createTaskDto.attachments.map((id) => ({ id })),
          },
        },
      });
    }

    return task;
  }

  async findAll(
    projectId?: string,
    userId?: string,
    assigneeId?: string,
    status?: string,
  ) {
    const where: {
      projectId?: string;
      assigneeId?: string;
      status?: string;
    } = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        attachments: {
          select: { id: true, name: true, url: true, type: true },
        },
        comments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { comments: true } },
        // NEW: include project phase
        projectPhase: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            order: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        attachments: {
          select: { id: true, name: true, url: true, type: true },
        },
        comments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        // NEW: include project phase
        projectPhase: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            order: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: task.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: task.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this task');
    }

    const updateData: any = { ...updateTaskDto };

    if (updateTaskDto.dueDate) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updateData.dueDate = new Date(updateTaskDto.dueDate);
    }
    if (updateTaskDto.startedAt) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updateData.startedAt = new Date(updateTaskDto.startedAt);
    }
    if (updateTaskDto.completedAt) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updateData.completedAt = new Date(updateTaskDto.completedAt);
    }

    // NEW: validate projectPhaseId if provided
    if (updateTaskDto.projectPhaseId) {
      const phase = await this.prisma.projectPhase.findUnique({
        where: { id: updateTaskDto.projectPhaseId },
      });
      if (!phase) {
        throw new NotFoundException('Project phase not found');
      }
      if (phase.projectId !== task.projectId) {
        throw new ForbiddenException(
          'Project phase does not belong to this project',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updateData.projectPhaseId = updateTaskDto.projectPhaseId;
    }

    // Remove attachments from data as we handle them separately
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
    const { attachments, ...taskUpdateData } = updateData;

    const updatedTask = await this.prisma.task.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: taskUpdateData,
      include: {
        project: { select: { id: true, name: true } },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        attachments: {
          select: { id: true, name: true, url: true, type: true },
        },
        comments: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        // NEW: include project phase
        projectPhase: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            order: true,
          },
        },
      },
    });

    // Update attachments if provided
    if (updateTaskDto.attachments) {
      await this.prisma.task.update({
        where: { id },
        data: {
          attachments: {
            set: [], // Clear existing attachments
            connect: updateTaskDto.attachments.map((attachmentId) => ({
              id: attachmentId,
            })),
          },
        },
      });
    }

    return updatedTask;
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: task.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return this.prisma.task.delete({
      where: { id },
    });
  }

  // Comment methods
  async createComment(createCommentDto: CreateCommentDto, userId: string) {
    // Check if task exists and user has access
    const task = await this.prisma.task.findUnique({
      where: { id: createCommentDto.taskId },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: task.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return this.prisma.comment.create({
      data: {
        taskId: createCommentDto.taskId,
        userId,
        content: createCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getTaskComments(taskId: string, userId: string) {
    // Check if task exists and user has access
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: task.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return this.prisma.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        task: {
          include: { project: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Only the author can update their comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: comment.task.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        content: updateCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        task: {
          include: { project: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Only the author can delete their comment
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: comment.task.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async getProjectTaskSummary(projectId: string, userId: string) {
    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      cancelledTasks,
      highPriorityTasks,
      overdueTasks,
    ] = await Promise.all([
      this.prisma.task.count({ where: { projectId } }),
      this.prisma.task.count({ where: { projectId, status: 'Pending' } }),
      this.prisma.task.count({ where: { projectId, status: 'In Progress' } }),
      this.prisma.task.count({ where: { projectId, status: 'Completed' } }),
      this.prisma.task.count({ where: { projectId, status: 'Cancelled' } }),
      this.prisma.task.count({
        where: { projectId, priority: { in: ['High', 'Critical'] } },
      }),
      this.prisma.task.count({
        where: {
          projectId,
          dueDate: { lt: new Date() },
          status: { not: 'Completed' },
        },
      }),
    ]);

    return {
      projectId,
      totalTasks,
      statusSummary: {
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        cancelled: cancelledTasks,
      },
      prioritySummary: {
        highPriority: highPriorityTasks,
      },
      overdueTasks,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }

  async getUserTaskStats(userId: string) {
    const [
      totalAssignedTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      tasksCompletedThisWeek,
    ] = await Promise.all([
      this.prisma.task.count({ where: { assigneeId: userId } }),
      this.prisma.task.count({
        where: { assigneeId: userId, status: 'Pending' },
      }),
      this.prisma.task.count({
        where: { assigneeId: userId, status: 'In Progress' },
      }),
      this.prisma.task.count({
        where: { assigneeId: userId, status: 'Completed' },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          dueDate: { lt: new Date() },
          status: { not: 'Completed' },
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'Completed',
          completedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return {
      userId,
      totalAssignedTasks,
      statusSummary: {
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
      },
      overdueTasks,
      tasksCompletedThisWeek,
      completionRate:
        totalAssignedTasks > 0
          ? Math.round((completedTasks / totalAssignedTasks) * 100)
          : 0,
    };
  }
}
