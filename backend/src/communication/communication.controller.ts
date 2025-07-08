import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { CommunicationService } from './communication.service';
import {
  CreateThreadDto,
  AddUserToThreadDto,
  CreateMessageDto,
  CreateRFIDto,
} from './dto/create-communication.dto';
import {
  UpdateThreadDto,
  UpdateMessageDto,
  UpdateRFIDto,
} from './dto/update-communication.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/auth.guard';

@Controller('communication')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  // Thread Routes
  @Post('threads')
  @ApiBearerAuth()
  createThread(
    @Body() createThreadDto: CreateThreadDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.createThread(
      createThreadDto,
      req.user.sub,
    );
  }

  @Get('threads')
  @ApiBearerAuth()
  getCurrentUserThreads(@Request() req: AuthenticatedRequest) {
    return this.communicationService.getCurrentUserThreads(req.user.sub);
  }

  @Get('threads/:id')
  @ApiBearerAuth()
  getThread(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.communicationService.getThread(id, req.user.sub);
  }

  @Patch('threads/:id')
  @ApiBearerAuth()
  updateThread(
    @Param('id') id: string,
    @Body() updateThreadDto: UpdateThreadDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.updateThread(
      id,
      updateThreadDto,
      req.user.sub,
    );
  }

  @Post('threads/:id/users')
  @ApiBearerAuth()
  addUserToThread(
    @Param('id') id: string,
    @Body() addUserDto: AddUserToThreadDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.addUserToThread(
      id,
      addUserDto,
      req.user.sub,
    );
  }

  @Delete('threads/:threadId/users/:userId')
  @ApiBearerAuth()
  removeUserFromThread(
    @Param('threadId') threadId: string,
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.removeUserFromThread(
      threadId,
      userId,
      req.user.sub,
    );
  }

  // Message Routes
  @Post('messages')
  @ApiBearerAuth()
  sendMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.sendMessage(
      createMessageDto,
      req.user.sub,
    );
  }

  @Get('threads/:id/messages')
  @ApiBearerAuth()
  getThreadMessages(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.getThreadMessages(id, req.user.sub);
  }

  @Patch('messages/:id')
  @ApiBearerAuth()
  updateMessage(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.updateMessage(
      id,
      updateMessageDto,
      req.user.sub,
    );
  }

  @Delete('messages/:id')
  @ApiBearerAuth()
  deleteMessage(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.communicationService.deleteMessage(id, req.user.sub);
  }

  // RFI Routes
  @Post('rfis')
  @ApiBearerAuth()
  createRFI(
    @Body() createRFIDto: CreateRFIDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.createRFI(createRFIDto, req.user.sub);
  }

  @Get('rfis')
  @ApiBearerAuth()
  getUserRFIs(@Request() req: AuthenticatedRequest) {
    return this.communicationService.getUserRFIs(req.user.sub);
  }

  @Patch('rfis/:id')
  @ApiBearerAuth()
  updateRFI(
    @Param('id') id: string,
    @Body() updateRFIDto: UpdateRFIDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.communicationService.updateRFI(id, updateRFIDto, req.user.sub);
  }

  @Delete('rfis/:id')
  @ApiBearerAuth()
  deleteRFI(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.communicationService.deleteRFI(id, req.user.sub);
  }

  // Additional utility routes

  @Get('threads/:id/participants')
  @ApiBearerAuth()
  async getThreadParticipants(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    // This will return the thread with participants only
    const thread = await this.communicationService.getThread(id, req.user.sub);
    return {
      participants: thread.users,
    };
  }

  @Get('rfis/:id')
  @ApiBearerAuth()
  async getRFI(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.communicationService.getRFI(id, req.user.sub);
  }
}
