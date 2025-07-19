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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignUserToProjectDto } from './dto/assign-user-to-project.dto';
import { UpdateUserProjectDto } from './dto/update-user-project.dto';
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
}
