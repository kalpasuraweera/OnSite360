import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  Put,
  NotFoundException,
  BadRequestException,
  Request,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignUserToProjectDto } from './dto/assign-user-to-project.dto';
import { UpdateUserProjectDto } from './dto/update-user-project.dto';
import { CreateCrewMemberDto } from './dto/create-crew-member.dto';
import { UpdateCrewMemberDto } from './dto/update-crew-member.dto';
import { CreateProjectAttendanceDto } from './dto/create-project-attendance.dto';
import { UpdateProjectAttendanceDto } from './dto/update-project-attendance.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/auth.guard';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBearerAuth()
  @Post()
  async create(@Body() createProjectDto: CreateProjectDto) {
    try {
      const project = await this.projectsService.create(createProjectDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Project created successfully',
        data: project,
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw new HttpException(
        'Failed to create project',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  @ApiBearerAuth()
  @Get()
  async findAll() {
    try {
      const projects = await this.projectsService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Projects retrieved successfully',
        data: projects,
      };
    } catch (error) {
      console.error('Error retrieving projects:', error);
      throw new HttpException(
        'Failed to retrieve projects',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get projects for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User projects retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @Get('my-projects')
  async getMyProjects(@Request() req: AuthenticatedRequest) {
    try {
      const userId = req.user?.sub; // Use 'sub' as that's what the JWT payload contains
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const projects = await this.projectsService.getUserProjects(userId);
      return {
        statusCode: HttpStatus.OK,
        message: 'User projects retrieved successfully',
        data: projects,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      console.error('Error retrieving user projects:', error);
      throw new HttpException(
        'Failed to retrieve user projects',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get all projects for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'User projects retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth()
  @Get('users/:userId/projects')
  async getUserProjects(@Param('userId') userId: string) {
    try {
      const projects = await this.projectsService.getUserProjects(userId);
      return {
        statusCode: HttpStatus.OK,
        message: 'User projects retrieved successfully',
        data: projects,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving user projects:', error);
      throw new HttpException(
        'Failed to retrieve user projects',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Crew Member Management Routes (must come before :id routes)
  @ApiOperation({ summary: 'Create a new crew member' })
  @ApiResponse({ status: 201, description: 'Crew member created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBearerAuth()
  @Post('crew-members')
  async createCrewMember(@Body() createCrewMemberDto: CreateCrewMemberDto) {
    try {
      const crewMember =
        await this.projectsService.createCrewMember(createCrewMemberDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Crew member created successfully',
        data: crewMember,
      };
    } catch (error) {
      console.error('Error creating crew member:', error);
      throw new HttpException(
        'Failed to create crew member',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get all crew members' })
  @ApiResponse({
    status: 200,
    description: 'Crew members retrieved successfully',
  })
  @ApiBearerAuth()
  @Get('crew-members')
  async getCrewMembers() {
    try {
      const crewMembers = await this.projectsService.getCrewMembers();
      return {
        statusCode: HttpStatus.OK,
        message: 'Crew members retrieved successfully',
        data: crewMembers,
      };
    } catch (error) {
      console.error('Error retrieving crew members:', error);
      throw new HttpException(
        'Failed to retrieve crew members',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get crew member by ID' })
  @ApiResponse({
    status: 200,
    description: 'Crew member retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Crew member not found' })
  @ApiBearerAuth()
  @Get('crew-members/:crewMemberId')
  async getCrewMember(@Param('crewMemberId') crewMemberId: string) {
    try {
      const crewMember = await this.projectsService.getCrewMember(crewMemberId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Crew member retrieved successfully',
        data: crewMember,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving crew member:', error);
      throw new HttpException(
        'Failed to retrieve crew member',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update crew member' })
  @ApiResponse({ status: 200, description: 'Crew member updated successfully' })
  @ApiResponse({ status: 404, description: 'Crew member not found' })
  @ApiBearerAuth()
  @Patch('crew-members/:crewMemberId')
  async updateCrewMember(
    @Param('crewMemberId') crewMemberId: string,
    @Body() updateCrewMemberDto: UpdateCrewMemberDto,
  ) {
    try {
      const crewMember = await this.projectsService.updateCrewMember(
        crewMemberId,
        updateCrewMemberDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Crew member updated successfully',
        data: crewMember,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating crew member:', error);
      throw new HttpException(
        'Failed to update crew member',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Delete crew member' })
  @ApiResponse({ status: 200, description: 'Crew member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Crew member not found' })
  @ApiBearerAuth()
  @Delete('crew-members/:crewMemberId')
  async deleteCrewMember(@Param('crewMemberId') crewMemberId: string) {
    try {
      await this.projectsService.deleteCrewMember(crewMemberId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Crew member deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting crew member:', error);
      throw new HttpException(
        'Failed to delete crew member',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const project = await this.projectsService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Project retrieved successfully',
        data: project,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving project:', error);
      throw new HttpException(
        'Failed to retrieve project',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    try {
      const project = await this.projectsService.update(id, updateProjectDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Project updated successfully',
        data: project,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating project:', error);
      throw new HttpException(
        'Failed to update project',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.projectsService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Project deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting project:', error);
      throw new HttpException(
        'Failed to delete project',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Assign a user to a project' })
  @ApiResponse({
    status: 201,
    description: 'User assigned to project successfully',
  })
  @ApiResponse({ status: 404, description: 'Project or user not found' })
  @ApiResponse({ status: 400, description: 'User already assigned to project' })
  @ApiBearerAuth()
  @Post(':id/users')
  async assignUserToProject(
    @Param('id') projectId: string,
    @Body() assignUserDto: AssignUserToProjectDto,
  ) {
    try {
      const assignment = await this.projectsService.assignUserToProject(
        projectId,
        assignUserDto,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User assigned to project successfully',
        data: assignment,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error assigning user to project:', error);
      throw new HttpException(
        'Failed to assign user to project',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update user project assignment' })
  @ApiResponse({
    status: 200,
    description: 'User project assignment updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiBearerAuth()
  @Put(':id/users/:userId')
  async updateUserProjectAssignment(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
    @Body() updateUserProjectDto: UpdateUserProjectDto,
  ) {
    try {
      const assignment = await this.projectsService.updateUserProjectAssignment(
        projectId,
        userId,
        updateUserProjectDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'User project assignment updated successfully',
        data: assignment,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating user project assignment:', error);
      throw new HttpException(
        'Failed to update user project assignment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Remove user from project' })
  @ApiResponse({
    status: 200,
    description: 'User removed from project successfully',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiBearerAuth()
  @Delete(':id/users/:userId')
  async removeUserFromProject(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
  ) {
    try {
      await this.projectsService.removeUserFromProject(projectId, userId);
      return {
        statusCode: HttpStatus.OK,
        message: 'User removed from project successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing user from project:', error);
      throw new HttpException(
        'Failed to remove user from project',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get all users assigned to a project' })
  @ApiResponse({
    status: 200,
    description: 'Project users retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Get(':id/users')
  async getProjectUsers(@Param('id') projectId: string) {
    try {
      const users = await this.projectsService.getProjectUsers(projectId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Project users retrieved successfully',
        data: users,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving project users:', error);
      throw new HttpException(
        'Failed to retrieve project users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get project statistics' })
  @ApiResponse({
    status: 200,
    description: 'Project statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Get(':id/statistics')
  async getProjectStatistics(@Param('id') projectId: string) {
    try {
      const statistics =
        await this.projectsService.getProjectStatistics(projectId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Project statistics retrieved successfully',
        data: statistics,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving project statistics:', error);
      throw new HttpException(
        'Failed to retrieve project statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Project Crew Assignment Routes
  @ApiOperation({ summary: 'Get crew members assigned to a project' })
  @ApiResponse({
    status: 200,
    description: 'Project crew members retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Get(':id/crew-members')
  async getProjectCrewMembers(@Param('id') projectId: string) {
    try {
      const crewMembers =
        await this.projectsService.getProjectCrewMembers(projectId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Project crew members retrieved successfully',
        data: crewMembers,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving project crew members:', error);
      throw new HttpException(
        'Failed to retrieve project crew members',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Assign crew member to project' })
  @ApiResponse({
    status: 201,
    description: 'Crew member assigned to project successfully',
  })
  @ApiResponse({ status: 404, description: 'Project or crew member not found' })
  @ApiResponse({
    status: 400,
    description: 'Crew member already assigned to project',
  })
  @ApiBearerAuth()
  @Post(':id/crew-members/:crewMemberId')
  async assignCrewMemberToProject(
    @Param('id') projectId: string,
    @Param('crewMemberId') crewMemberId: string,
    @Body() body: { notes?: string },
  ) {
    try {
      const assignment = await this.projectsService.assignCrewMemberToProject(
        projectId,
        crewMemberId,
        body.notes,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Crew member assigned to project successfully',
        data: assignment,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error assigning crew member to project:', error);
      throw new HttpException(
        'Failed to assign crew member to project',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Remove crew member from project' })
  @ApiResponse({
    status: 200,
    description: 'Crew member removed from project successfully',
  })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiBearerAuth()
  @Delete(':id/crew-members/:crewMemberId')
  async removeCrewMemberFromProject(
    @Param('id') projectId: string,
    @Param('crewMemberId') crewMemberId: string,
  ) {
    try {
      await this.projectsService.removeCrewMemberFromProject(
        projectId,
        crewMemberId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Crew member removed from project successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing crew member from project:', error);
      throw new HttpException(
        'Failed to remove crew member from project',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Project Attendance Routes
  @ApiOperation({ summary: 'Create project attendance record' })
  @ApiResponse({
    status: 201,
    description: 'Project attendance created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Attendance already exists for this date',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Post(':id/attendance')
  async createProjectAttendance(
    @Param('id') projectId: string,
    @Body() createAttendanceDto: CreateProjectAttendanceDto,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const attendance = await this.projectsService.createProjectAttendance(
        projectId,
        userId,
        createAttendanceDto,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Project attendance created successfully',
        data: attendance,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      console.error('Error creating project attendance:', error);
      throw new HttpException(
        'Failed to create project attendance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Mark attendance for crew members' })
  @ApiResponse({
    status: 200,
    description: 'Attendance marked successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 400, description: 'Invalid crew member assignments' })
  @ApiBearerAuth()
  @Post(':id/attendance/:date/mark')
  async markAttendance(
    @Param('id') projectId: string,
    @Param('date') date: string,
    @Body() markAttendanceDto: MarkAttendanceDto,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const result = await this.projectsService.markAttendance(
        projectId,
        date,
        userId,
        markAttendanceDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Attendance marked successfully',
        data: result,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      console.error('Error marking attendance:', error);
      throw new HttpException(
        'Failed to mark attendance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get project attendance by date' })
  @ApiResponse({
    status: 200,
    description: 'Project attendance retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Attendance not found' })
  @ApiBearerAuth()
  @Get(':id/attendance/:date')
  async getProjectAttendanceByDate(
    @Param('id') projectId: string,
    @Param('date') date: string,
  ) {
    try {
      const attendance = await this.projectsService.getProjectAttendanceByDate(
        projectId,
        date,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Project attendance retrieved successfully',
        data: attendance,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving project attendance:', error);
      throw new HttpException(
        'Failed to retrieve project attendance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get project attendance history' })
  @ApiResponse({
    status: 200,
    description: 'Project attendance history retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Get(':id/attendance')
  async getProjectAttendanceHistory(
    @Param('id') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const attendance = await this.projectsService.getProjectAttendanceHistory(
        projectId,
        startDate,
        endDate,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Project attendance history retrieved successfully',
        data: attendance,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving project attendance history:', error);
      throw new HttpException(
        'Failed to retrieve project attendance history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update project attendance' })
  @ApiResponse({
    status: 200,
    description: 'Project attendance updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Attendance not found' })
  @ApiBearerAuth()
  @Patch(':id/attendance/:date')
  async updateProjectAttendance(
    @Param('id') projectId: string,
    @Param('date') date: string,
    @Body() updateAttendanceDto: UpdateProjectAttendanceDto,
  ) {
    try {
      const attendance = await this.projectsService.updateProjectAttendance(
        projectId,
        date,
        updateAttendanceDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Project attendance updated successfully',
        data: attendance,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating project attendance:', error);
      throw new HttpException(
        'Failed to update project attendance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Delete project attendance' })
  @ApiResponse({
    status: 200,
    description: 'Project attendance deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Attendance not found' })
  @ApiBearerAuth()
  @Delete(':id/attendance/:date')
  async deleteProjectAttendance(
    @Param('id') projectId: string,
    @Param('date') date: string,
  ) {
    try {
      await this.projectsService.deleteProjectAttendance(projectId, date);
      return {
        statusCode: HttpStatus.OK,
        message: 'Project attendance deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting project attendance:', error);
      throw new HttpException(
        'Failed to delete project attendance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
