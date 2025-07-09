import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/auth.guard';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';

@Controller('tasks')
@ApiTags('Tasks')
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: Task,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.create(createTaskDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filtering' })
  @ApiQuery({
    name: 'projectId',
    description: 'Filter tasks by project ID',
    required: false,
  })
  @ApiQuery({
    name: 'assigneeId',
    description: 'Filter tasks by assignee ID',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter tasks by status',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    type: [Task],
  })
  findAll(
    @Query('projectId') projectId?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('status') status?: string,
    @Request() req?: AuthenticatedRequest,
  ) {
    return this.tasksService.findAll(
      projectId,
      req?.user.sub,
      assigneeId,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.remove(id, req.user.sub);
  }

  // Comment Routes
  @Post('comments')
  @ApiOperation({ summary: 'Add a comment to a task' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: Comment,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.createComment(createCommentDto, req.user.sub);
  }

  @Get(':taskId/comments')
  @ApiOperation({ summary: 'Get all comments for a task' })
  @ApiParam({ name: 'taskId', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: [Comment],
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getTaskComments(
    @Param('taskId') taskId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.getTaskComments(taskId, req.user.sub);
  }

  @Patch('comments/:commentId')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: Comment,
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.updateComment(
      commentId,
      updateCommentDto,
      req.user.sub,
    );
  }

  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  deleteComment(
    @Param('commentId') commentId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.deleteComment(commentId, req.user.sub);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get tasks assigned to the current user' })
  @ApiQuery({
    name: 'projectId',
    description: 'Filter by project ID',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by task status',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'User tasks retrieved successfully',
    type: [Task],
  })
  getMyTasks(
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Request() req?: AuthenticatedRequest,
  ) {
    return this.tasksService.findAll(
      projectId,
      req?.user.sub,
      req?.user.sub,
      status,
    );
  }

  @Get('project/:projectId/summary')
  @ApiOperation({ summary: 'Get task summary for a project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Task summary retrieved successfully',
  })
  getProjectTaskSummary(
    @Param('projectId') projectId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.getProjectTaskSummary(projectId, req.user.sub);
  }

  @Get('stats/user')
  @ApiOperation({ summary: 'Get task statistics for the current user' })
  @ApiResponse({
    status: 200,
    description: 'User task statistics retrieved successfully',
  })
  getUserTaskStats(@Request() req: AuthenticatedRequest) {
    return this.tasksService.getUserTaskStats(req.user.sub);
  }
}
