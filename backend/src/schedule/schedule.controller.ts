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
import { ScheduleService } from './schedule.service';
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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/auth.guard';

@Controller('schedule')
@ApiTags('Schedule')
@ApiBearerAuth()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // Project Phase Routes
  @Post('project-phases')
  @ApiOperation({ summary: 'Create a new project phase' })
  createProjectPhase(
    @Body() createProjectPhaseDto: CreateProjectPhaseDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.createProjectPhase(
      createProjectPhaseDto,
      req.user.sub,
    );
  }

  @Get('project-phases')
  @ApiOperation({ summary: 'Get all project phases for a project' })
  @ApiQuery({ name: 'projectId', description: 'Project ID', required: true })
  getProjectPhases(
    @Query('projectId') projectId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.getProjectPhases(projectId, req.user.sub);
  }

  @Get('project-phases/:id')
  @ApiOperation({ summary: 'Get a specific project phase' })
  @ApiParam({ name: 'id', description: 'Project phase ID' })
  getProjectPhase(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.getProjectPhase(id, req.user.sub);
  }

  @Patch('project-phases/:id')
  @ApiOperation({ summary: 'Update a project phase' })
  @ApiParam({ name: 'id', description: 'Project phase ID' })
  updateProjectPhase(
    @Param('id') id: string,
    @Body() updateProjectPhaseDto: UpdateProjectPhaseDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.updateProjectPhase(
      id,
      updateProjectPhaseDto,
      req.user.sub,
    );
  }

  @Delete('project-phases/:id')
  @ApiOperation({ summary: 'Delete a project phase' })
  @ApiParam({ name: 'id', description: 'Project phase ID' })
  deleteProjectPhase(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.deleteProjectPhase(id, req.user.sub);
  }

  // Schedule Event Routes
  @Post('events')
  @ApiOperation({ summary: 'Create a new schedule event' })
  createScheduleEvent(
    @Body() createScheduleEventDto: CreateScheduleEventDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.createScheduleEvent(
      createScheduleEventDto,
      req.user.sub,
    );
  }

  @Get('events')
  @ApiOperation({ summary: 'Get all schedule events for a project' })
  @ApiQuery({ name: 'projectId', description: 'Project ID', required: true })
  getScheduleEvents(
    @Query('projectId') projectId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.getScheduleEvents(projectId, req.user.sub);
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get a specific schedule event' })
  @ApiParam({ name: 'id', description: 'Schedule event ID' })
  getScheduleEvent(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.getScheduleEvent(id, req.user.sub);
  }

  @Patch('events/:id')
  @ApiOperation({ summary: 'Update a schedule event' })
  @ApiParam({ name: 'id', description: 'Schedule event ID' })
  updateScheduleEvent(
    @Param('id') id: string,
    @Body() updateScheduleEventDto: UpdateScheduleEventDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.updateScheduleEvent(
      id,
      updateScheduleEventDto,
      req.user.sub,
    );
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete a schedule event' })
  @ApiParam({ name: 'id', description: 'Schedule event ID' })
  deleteScheduleEvent(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.deleteScheduleEvent(id, req.user.sub);
  }

  // Daily Log Routes
  @Post('daily-logs')
  @ApiOperation({ summary: 'Create a new daily log' })
  createDailyLog(
    @Body() createDailyLogDto: CreateDailyLogDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.createDailyLog(createDailyLogDto, req.user.sub);
  }

  @Get('daily-logs')
  @ApiOperation({ summary: 'Get all daily logs for a project' })
  @ApiQuery({ name: 'projectId', description: 'Project ID', required: true })
  getDailyLogs(
    @Query('projectId') projectId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.getDailyLogs(projectId, req.user.sub);
  }

  @Get('daily-logs/by-date')
  @ApiOperation({
    summary: 'Get daily logs with activities by date and project',
  })
  @ApiQuery({ name: 'projectId', description: 'Project ID', required: true })
  @ApiQuery({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    required: true,
  })
  getDailyLogsByDate(
    @Query('projectId') projectId: string,
    @Query('date') date: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.getDailyLogsByDate(
      projectId,
      date,
      req.user.sub,
    );
  }

  @Get('daily-logs/:id')
  @ApiOperation({ summary: 'Get a specific daily log with activities' })
  @ApiParam({ name: 'id', description: 'Daily log ID' })
  getDailyLog(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.scheduleService.getDailyLog(id, req.user.sub);
  }

  @Patch('daily-logs/:id')
  @ApiOperation({
    summary: 'Update a daily log (only by owner, same day only)',
  })
  @ApiParam({ name: 'id', description: 'Daily log ID' })
  updateDailyLog(
    @Param('id') id: string,
    @Body() updateDailyLogDto: UpdateDailyLogDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.updateDailyLog(
      id,
      updateDailyLogDto,
      req.user.sub,
    );
  }

  @Delete('daily-logs/:id')
  @ApiOperation({
    summary: 'Delete a daily log (only by owner, same day only)',
  })
  @ApiParam({ name: 'id', description: 'Daily log ID' })
  deleteDailyLog(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.deleteDailyLog(id, req.user.sub);
  }

  // Daily Activity Routes
  @Post('daily-activities')
  @ApiOperation({ summary: 'Create a new daily activity' })
  createDailyActivity(
    @Body() createDailyActivityDto: CreateDailyActivityDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.createDailyActivity(
      createDailyActivityDto,
      req.user.sub,
    );
  }

  @Get('daily-activities')
  @ApiOperation({ summary: 'Get all activities for a daily log' })
  @ApiQuery({ name: 'logId', description: 'Daily log ID', required: true })
  getDailyActivities(
    @Query('logId') logId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.getDailyActivities(logId, req.user.sub);
  }

  @Get('daily-activities/:id')
  @ApiOperation({ summary: 'Get a specific daily activity' })
  @ApiParam({ name: 'id', description: 'Daily activity ID' })
  getDailyActivity(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.getDailyActivity(id, req.user.sub);
  }

  @Patch('daily-activities/:id')
  @ApiOperation({
    summary: 'Update a daily activity (only by log owner, same day only)',
  })
  @ApiParam({ name: 'id', description: 'Daily activity ID' })
  updateDailyActivity(
    @Param('id') id: string,
    @Body() updateDailyActivityDto: UpdateDailyActivityDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.updateDailyActivity(
      id,
      updateDailyActivityDto,
      req.user.sub,
    );
  }

  @Delete('daily-activities/:id')
  @ApiOperation({
    summary: 'Delete a daily activity (only by log owner, same day only)',
  })
  @ApiParam({ name: 'id', description: 'Daily activity ID' })
  deleteDailyActivity(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.scheduleService.deleteDailyActivity(id, req.user.sub);
  }
}
