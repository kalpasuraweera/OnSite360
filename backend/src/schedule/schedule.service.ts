import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProjectPhaseDto,
  CreateScheduleEventDto,
  CreateDailyLogDto,
  CreateDailyActivityDto,
} from './dto/create-schedule.dto';
import {
  UpdateProjectPhaseDto,
  UpdateScheduleEventDto,
  UpdateDailyLogDto,
  UpdateDailyActivityDto,
} from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  // Project Phase CRUD operations
  async createProjectPhase(
    createProjectPhaseDto: CreateProjectPhaseDto,
    userId: string,
  ) {
    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: createProjectPhaseDto.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Get the max order value for the project
    const maxOrder = await this.prisma.projectPhase.findFirst({
      where: { projectId: createProjectPhaseDto.projectId },
      select: { order: true },
      orderBy: { order: 'desc' },
    });

    const nextOrder = maxOrder ? maxOrder.order + 1 : 1;

    return this.prisma.projectPhase.create({
      data: {
        ...createProjectPhaseDto,
        startDate: new Date(createProjectPhaseDto.startDate),
        endDate: new Date(createProjectPhaseDto.endDate),
        order: nextOrder,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getProjectPhases(projectId: string, userId: string) {
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

    return this.prisma.projectPhase.findMany({
      where: { projectId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        // NEW: include tasks for each phase
        tasks: {
          orderBy: { createdAt: 'asc' },
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            // include basic phase linkage
            projectPhase: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async getProjectPhase(phaseId: string, userId: string) {
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id: phaseId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        // NEW: include tasks for the phase
        tasks: {
          orderBy: { createdAt: 'asc' },
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            projectPhase: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!phase) {
      throw new NotFoundException('Project phase not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: phase.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return phase;
  }

  async updateProjectPhase(
    phaseId: string,
    updateProjectPhaseDto: UpdateProjectPhaseDto,
    userId: string,
  ) {
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id: phaseId },
    });

    if (!phase) {
      throw new NotFoundException('Project phase not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: phase.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.projectPhase.update({
      where: { id: phaseId },
      data: {
        ...updateProjectPhaseDto,
        startDate: updateProjectPhaseDto.startDate
          ? new Date(updateProjectPhaseDto.startDate)
          : undefined,
        endDate: updateProjectPhaseDto.endDate
          ? new Date(updateProjectPhaseDto.endDate)
          : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteProjectPhase(phaseId: string, userId: string) {
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id: phaseId },
    });

    if (!phase) {
      throw new NotFoundException('Project phase not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: phase.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.projectPhase.delete({
      where: { id: phaseId },
    });
  }

  // Schedule Event CRUD operations
  async createScheduleEvent(
    createScheduleEventDto: CreateScheduleEventDto,
    userId: string,
  ) {
    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: createScheduleEventDto.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const { assignedUserId, ...eventData } = createScheduleEventDto;

    return this.prisma.scheduleEvent.create({
      data: {
        ...eventData,
        startDate: new Date(createScheduleEventDto.startDate),
        endDate: new Date(createScheduleEventDto.endDate),
        allDay: createScheduleEventDto.allDay || false,
        createdById: userId,
        assignees: assignedUserId
          ? {
              connect: { id: assignedUserId },
            }
          : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getScheduleEvents(projectId: string, userId: string) {
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

    return this.prisma.scheduleEvent.findMany({
      where: { projectId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async getScheduleEvent(eventId: string, userId: string) {
    const event = await this.prisma.scheduleEvent.findUnique({
      where: { id: eventId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Schedule event not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: event.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return event;
  }

  async updateScheduleEvent(
    eventId: string,
    updateScheduleEventDto: UpdateScheduleEventDto,
    userId: string,
  ) {
    const event = await this.prisma.scheduleEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Schedule event not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: event.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Check if user is the creator of the event
    if (event.createdById !== userId) {
      throw new ForbiddenException('You can only edit events you created');
    }

    const { assignedUserId, allDay, ...updateData } = updateScheduleEventDto;

    return this.prisma.scheduleEvent.update({
      where: { id: eventId },
      data: {
        ...updateData,
        startDate: updateScheduleEventDto.startDate
          ? new Date(updateScheduleEventDto.startDate)
          : undefined,
        endDate: updateScheduleEventDto.endDate
          ? new Date(updateScheduleEventDto.endDate)
          : undefined,
        allDay: allDay !== undefined ? allDay : undefined,
        assignees: assignedUserId
          ? {
              set: [{ id: assignedUserId }],
            }
          : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteScheduleEvent(eventId: string, userId: string) {
    const event = await this.prisma.scheduleEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Schedule event not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: event.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Check if user is the creator of the event
    if (event.createdById !== userId) {
      throw new ForbiddenException('You can only delete events you created');
    }

    return this.prisma.scheduleEvent.delete({
      where: { id: eventId },
    });
  }

  // Daily Log CRUD operations
  async createDailyLog(createDailyLogDto: CreateDailyLogDto, userId: string) {
    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: createDailyLogDto.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Check if log already exists for this date and project
    const existingLog = await this.prisma.dailyLog.findFirst({
      where: {
        date: new Date(createDailyLogDto.date),
        projectId: createDailyLogDto.projectId,
        loggedById: userId,
      },
    });

    if (existingLog) {
      throw new ForbiddenException('Daily log already exists for this date');
    }

    const { notes, ...logData } = createDailyLogDto;

    return this.prisma.dailyLog.create({
      data: {
        ...logData,
        date: new Date(createDailyLogDto.date),
        summary: notes || 'Daily log entry',
        loggedById: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        logger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });
  }

  async getDailyLogs(projectId: string, userId: string) {
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

    return this.prisma.dailyLog.findMany({
      where: { projectId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        logger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'asc' },
          include: {
            dailyLog: {
              select: {
                id: true,
                date: true,
              },
            },
          },
        },
        _count: {
          select: {
            activities: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getDailyLogsByDate(projectId: string, date: string, userId: string) {
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

    // Parse the date and set it to start of day
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Create end of day for range query
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.dailyLog.findMany({
      where: {
        projectId,
        date: {
          gte: targetDate,
          lte: endOfDay,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        logger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'asc' },
          include: {
            dailyLog: {
              select: {
                id: true,
                date: true,
              },
            },
          },
        },
        _count: {
          select: {
            activities: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDailyLog(logId: string, userId: string) {
    const log = await this.prisma.dailyLog.findUnique({
      where: { id: logId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        logger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!log) {
      throw new NotFoundException('Daily log not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: log.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return log;
  }

  async updateDailyLog(
    logId: string,
    updateDailyLogDto: UpdateDailyLogDto,
    userId: string,
  ) {
    const log = await this.prisma.dailyLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new NotFoundException('Daily log not found');
    }

    // Check if user is the owner of the log
    if (log.loggedById !== userId) {
      throw new ForbiddenException('You can only edit your own daily logs');
    }

    // Check if the log's date is today or in the future (no editing past logs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (logDate < today) {
      throw new ForbiddenException('Cannot edit logs from previous days');
    }

    const { notes, ...updateData } = updateDailyLogDto;

    return this.prisma.dailyLog.update({
      where: { id: logId },
      data: {
        ...updateData,
        date: updateDailyLogDto.date
          ? new Date(updateDailyLogDto.date)
          : undefined,
        summary: notes || log.summary,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        logger: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async deleteDailyLog(logId: string, userId: string) {
    const log = await this.prisma.dailyLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new NotFoundException('Daily log not found');
    }

    // Check if user is the owner of the log
    if (log.loggedById !== userId) {
      throw new ForbiddenException('You can only delete your own daily logs');
    }

    // Check if the log's date is today or in the future (no deleting past logs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (logDate < today) {
      throw new ForbiddenException('Cannot delete logs from previous days');
    }

    return this.prisma.dailyLog.delete({
      where: { id: logId },
    });
  }

  // Daily Activity CRUD operations
  async createDailyActivity(
    createDailyActivityDto: CreateDailyActivityDto,
    userId: string,
  ) {
    const log = await this.prisma.dailyLog.findUnique({
      where: { id: createDailyActivityDto.dailyLogId },
    });

    if (!log) {
      throw new NotFoundException('Daily log not found');
    }

    // Check if user is the owner of the log
    if (log.loggedById !== userId) {
      throw new ForbiddenException(
        'You can only add activities to your own daily logs',
      );
    }

    // Check if the log's date is today or in the future (no editing past logs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (logDate < today) {
      throw new ForbiddenException(
        'Cannot add activities to logs from previous days',
      );
    }

    // If a taskId is provided, validate it and ensure it's in the same project
    let taskConnect: { connect: { id: string } } | undefined;
    if (createDailyActivityDto.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: createDailyActivityDto.taskId },
      });
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      if (task.projectId !== log.projectId) {
        throw new ForbiddenException('Task does not belong to this project');
      }
      taskConnect = { connect: { id: task.id } };
    }

    const { startTime, endTime, ...activityData } = createDailyActivityDto;

    return this.prisma.dailyActivity.create({
      data: {
        ...activityData,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        // persist taskId if provided
        ...(taskConnect ? { taskId: createDailyActivityDto.taskId } : {}),
      },
      include: {
        dailyLog: {
          select: {
            id: true,
            date: true,
            projectId: true,
            logger: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        // NEW: include task details
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            progress: true,
            dueDate: true,
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            projectPhaseId: true,
          },
        },
      },
    });
  }

  async getDailyActivities(logId: string, userId: string) {
    const log = await this.prisma.dailyLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new NotFoundException('Daily log not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: log.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.dailyActivity.findMany({
      where: { dailyLogId: logId },
      include: {
        dailyLog: {
          select: {
            id: true,
            date: true,
            projectId: true,
            logger: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        // NEW: include task details
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            progress: true,
            dueDate: true,
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            projectPhaseId: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getDailyActivity(activityId: string, userId: string) {
    const activity = await this.prisma.dailyActivity.findUnique({
      where: { id: activityId },
      include: {
        dailyLog: {
          select: {
            id: true,
            date: true,
            projectId: true,
            loggedById: true,
            logger: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        // NEW: include task details
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            progress: true,
            dueDate: true,
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            projectPhaseId: true,
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Daily activity not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: activity.dailyLog.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return activity;
  }

  async updateDailyActivity(
    activityId: string,
    updateDailyActivityDto: UpdateDailyActivityDto,
    userId: string,
  ) {
    const activity = await this.prisma.dailyActivity.findUnique({
      where: { id: activityId },
      include: {
        dailyLog: true,
      },
    });

    if (!activity) {
      throw new NotFoundException('Daily activity not found');
    }

    // Check if user is the owner of the log
    if (activity.dailyLog.loggedById !== userId) {
      throw new ForbiddenException(
        'You can only edit activities in your own daily logs',
      );
    }

    // Check if the log's date is today or in the future (no editing past logs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logDate = new Date(activity.dailyLog.date);
    logDate.setHours(0, 0, 0, 0);

    if (logDate < today) {
      throw new ForbiddenException('Cannot edit activities from previous days');
    }

    // If updating taskId, validate task belongs to same project
    if (updateDailyActivityDto.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: updateDailyActivityDto.taskId },
      });
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      if (task.projectId !== activity.dailyLog.projectId) {
        throw new ForbiddenException('Task does not belong to this project');
      }
    }

    const { startTime, endTime, ...updateData } = updateDailyActivityDto;

    return this.prisma.dailyActivity.update({
      where: { id: activityId },
      data: {
        ...updateData,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
      },
      include: {
        dailyLog: {
          select: {
            id: true,
            date: true,
            projectId: true,
            logger: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        // NEW: include task details
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            progress: true,
            dueDate: true,
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            projectPhaseId: true,
          },
        },
      },
    });
  }

  async deleteDailyActivity(activityId: string, userId: string) {
    const activity = await this.prisma.dailyActivity.findUnique({
      where: { id: activityId },
      include: {
        dailyLog: true,
      },
    });

    if (!activity) {
      throw new NotFoundException('Daily activity not found');
    }

    // Check if user is the owner of the log
    if (activity.dailyLog.loggedById !== userId) {
      throw new ForbiddenException(
        'You can only delete activities from your own daily logs',
      );
    }

    // Check if the log's date is today or in the future (no deleting past logs)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logDate = new Date(activity.dailyLog.date);
    logDate.setHours(0, 0, 0, 0);

    if (logDate < today) {
      throw new ForbiddenException(
        'Cannot delete activities from previous days',
      );
    }

    return this.prisma.dailyActivity.delete({
      where: { id: activityId },
    });
  }
}
