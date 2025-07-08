import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateThreadDto,
  AddUserToThreadDto,
  CreateMessageDto,
  CreateRFIDto,
} from './dto/create-communication.dto';
import {
  UpdateRFIDto,
  UpdateThreadDto,
  UpdateMessageDto,
} from './dto/update-communication.dto';

@Injectable()
export class CommunicationService {
  constructor(private prisma: PrismaService) {}

  // Create a new thread
  async createThread(createThreadDto: CreateThreadDto, userId: string) {
    const { participantIds = [], ...threadData } = createThreadDto;

    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: createThreadDto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has access to the project
    const userProject = await this.prisma.userProject.findFirst({
      where: {
        userId,
        projectId: createThreadDto.projectId,
        isActive: true,
      },
    });

    if (!userProject) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Include the creator as a participant
    const allParticipantIds = [...new Set([userId, ...participantIds])];

    return this.prisma.thread.create({
      data: {
        ...threadData,
        users: {
          connect: allParticipantIds.map((id) => ({ id })),
        },
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });
  }

  // Update a thread
  async updateThread(
    threadId: string,
    updateThreadDto: UpdateThreadDto,
    userId: string,
  ) {
    // Check if thread exists and user is a participant
    const thread = await this.prisma.thread.findFirst({
      where: {
        id: threadId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found or access denied');
    }

    return this.prisma.thread.update({
      where: { id: threadId },
      data: updateThreadDto,
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });
  }

  // Add a user to a thread
  async addUserToThread(
    threadId: string,
    addUserDto: AddUserToThreadDto,
    currentUserId: string,
  ) {
    // Check if thread exists and current user is a participant
    const thread = await this.prisma.thread.findFirst({
      where: {
        id: threadId,
        users: {
          some: {
            id: currentUserId,
          },
        },
      },
      include: {
        users: true,
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found or access denied');
    }

    // Check if user to be added exists
    const userToAdd = await this.prisma.user.findUnique({
      where: { id: addUserDto.userId },
    });

    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a participant
    const isAlreadyParticipant = thread.users.some(
      (p) => p.id === addUserDto.userId,
    );

    if (isAlreadyParticipant) {
      throw new ForbiddenException('User is already a participant');
    }

    return this.prisma.thread.update({
      where: { id: threadId },
      data: {
        users: {
          connect: { id: addUserDto.userId },
        },
      },
      include: {
        users: {
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

  // Send a message to a thread
  async sendMessage(createMessageDto: CreateMessageDto, userId: string) {
    // Check if thread exists and user is a participant
    const thread = await this.prisma.thread.findFirst({
      where: {
        id: createMessageDto.threadId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found or access denied');
    }

    return this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        threadId: createMessageDto.threadId,
        senderId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        thread: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  // Update a message
  async updateMessage(
    messageId: string,
    updateMessageDto: UpdateMessageDto,
    userId: string,
  ) {
    // First, find the message and check if user is the sender
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId, // Only the sender can update their own message
      },
      include: {
        thread: {
          include: {
            users: true, // Include thread participants for additional validation
          },
        },
      },
    });

    if (!message || !message.thread) {
      throw new NotFoundException('Message not found or access denied');
    }

    // Additional check: ensure user is still a participant in the thread
    const isParticipant = message.thread.users.some(
      (user) => user.id === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        'You are no longer a participant in this thread',
      );
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: updateMessageDto,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        thread: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  // Delete a message
  async deleteMessage(messageId: string, userId: string) {
    // First, find the message and check if user is the sender
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId, // Only the sender can delete their own message
      },
      include: {
        thread: {
          include: {
            users: true, // Include thread participants for additional validation
          },
        },
      },
    });

    if (!message || !message.thread) {
      throw new NotFoundException('Message not found or access denied');
    }

    // Additional check: ensure user is still a participant in the thread
    const isParticipant = message.thread.users.some(
      (user) => user.id === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        'You are no longer a participant in this thread',
      );
    }

    // Delete the message
    await this.prisma.message.delete({
      where: { id: messageId },
    });

    return { success: true, message: 'Message deleted successfully' };
  }

  // Get current user's threads
  async getCurrentUserThreads(userId: string) {
    return this.prisma.thread.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  // Get thread messages
  async getThreadMessages(threadId: string, userId: string) {
    // Check if user has access to the thread
    const thread = await this.prisma.thread.findFirst({
      where: {
        id: threadId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found or access denied');
    }

    return this.prisma.message.findMany({
      where: {
        threadId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Create RFI inside a thread
  async createRFI(createRFIDto: CreateRFIDto, userId: string) {
    // Check if thread exists and user is a participant
    const thread = await this.prisma.thread.findFirst({
      where: {
        id: createRFIDto.threadId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found or access denied');
    }

    return this.prisma.rFI.create({
      data: {
        title: createRFIDto.title,
        description: createRFIDto.description,
        priority: createRFIDto.priority || 'Medium',
        status: 'Open',
        threadId: createRFIDto.threadId,
        projectId: thread.projectId,
        requestedById: userId,
        assignedToIds: createRFIDto.assigneeId ? [createRFIDto.assigneeId] : [],
        assignedTo: [], // We'll populate names separately if needed
        requestedBy: '', // We'll populate from user data
        category: 'General',
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
        thread: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Get RFIs related to the user
  async getUserRFIs(userId: string) {
    return this.prisma.rFI.findMany({
      where: {
        OR: [
          { requestedById: userId },
          {
            assignees: {
              some: {
                id: userId,
              },
            },
          },
          {
            thread: {
              users: {
                some: {
                  id: userId,
                },
              },
            },
          },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
        thread: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Update RFI (only requester, assignee, or thread participant can update)
  async updateRFI(rfiId: string, updateRFIDto: UpdateRFIDto, userId: string) {
    // First, find the RFI and check access
    const rfi = await this.prisma.rFI.findFirst({
      where: {
        id: rfiId,
        OR: [
          { requestedById: userId },
          {
            assignees: {
              some: {
                id: userId,
              },
            },
          },
          {
            thread: {
              users: {
                some: {
                  id: userId,
                },
              },
            },
          },
        ],
      },
    });

    if (!rfi) {
      throw new NotFoundException('RFI not found or access denied');
    }

    return this.prisma.rFI.update({
      where: { id: rfiId },
      data: updateRFIDto,
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
        thread: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Delete RFI (only requester or thread participant can delete)
  async deleteRFI(rfiId: string, userId: string) {
    // First, find the RFI and check access
    const rfi = await this.prisma.rFI.findFirst({
      where: {
        id: rfiId,
        OR: [
          { requestedById: userId }, // Only requester can delete
          {
            thread: {
              users: {
                some: {
                  id: userId,
                },
              },
            },
          },
        ],
      },
      include: {
        thread: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!rfi) {
      throw new NotFoundException('RFI not found or access denied');
    }

    // Additional business rule: Only allow deletion if RFI is still in 'Open' status
    // This prevents deletion of RFIs that are already being worked on or completed
    if (rfi.status !== 'Open') {
      throw new ForbiddenException(
        'Cannot delete RFI that is no longer in Open status',
      );
    }

    // Delete the RFI
    await this.prisma.rFI.delete({
      where: { id: rfiId },
    });

    return { success: true, message: 'RFI deleted successfully' };
  }

  // Get single thread details
  async getThread(threadId: string, userId: string) {
    const thread = await this.prisma.thread.findFirst({
      where: {
        id: threadId,
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        rfis: {
          include: {
            requester: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
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
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found or access denied');
    }

    return thread;
  }

  // Remove user from thread (only thread participants can do this)
  async removeUserFromThread(
    threadId: string,
    userIdToRemove: string,
    currentUserId: string,
  ) {
    // Check if thread exists and current user is a participant
    const thread = await this.prisma.thread.findFirst({
      where: {
        id: threadId,
        users: {
          some: {
            id: currentUserId,
          },
        },
      },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found or unauthorized');
    }

    return this.prisma.thread.update({
      where: { id: threadId },
      data: {
        users: {
          disconnect: { id: userIdToRemove },
        },
      },
      include: {
        users: {
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
}
