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
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  UploadedFile,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
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
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/auth.guard';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBearerAuth()
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/projects';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, uuidv4() + ext);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    try {
      // If an image was uploaded, construct its URL and use for both logo and featured image (unless provided)
      const imageUrl = file ? `/uploads/projects/${file.filename}` : undefined;
      if (imageUrl) {
        // Mutate DTO to include urls if not already set
        // (CreateProjectDto should allow optional logoUrl/featuredImageUrl)
        createProjectDto.logoUrl = imageUrl;
        createProjectDto.featuredImageUrl = imageUrl;
      }

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

  @ApiOperation({ summary: 'Get all issues across all projects' })
  @ApiResponse({
    status: 200,
    description: 'All issues retrieved successfully',
  })
  @ApiBearerAuth()
  @Get('issues')
  async getAllIssues() {
    try {
      const issues = await this.projectsService.getAllIssues();
      return {
        statusCode: HttpStatus.OK,
        message: 'All issues retrieved successfully',
        data: issues,
      };
    } catch (error) {
      console.error('Error retrieving all issues:', error);
      throw new HttpException(
        'Failed to retrieve all issues',
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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/projects';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, uuidv4() + ext);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    try {
      // If an image was uploaded, construct its URL and use for both logo and featured image (unless provided)
      const imageUrl = file ? `/uploads/projects/${file.filename}` : undefined;
      if (imageUrl) {
        // Mutate DTO to include urls if not already set
        updateProjectDto.logoUrl = imageUrl;
        updateProjectDto.featuredImageUrl = imageUrl;
      }

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

  // Issue Management Routes
  @ApiOperation({ summary: 'Create a new issue for a project' })
  @ApiResponse({ status: 201, description: 'Issue created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Post(':id/issues')
  async createIssue(
    @Param('id') projectId: string,
    @Body() createIssueDto: CreateIssueDto,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const reportedById = req.user?.sub;
      const issue = await this.projectsService.createIssue(
        projectId,
        createIssueDto,
        reportedById,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Issue created successfully',
        data: issue,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error creating issue:', error);
      throw new HttpException(
        'Failed to create issue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get all issues for a project' })
  @ApiResponse({
    status: 200,
    description: 'Project issues retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Get(':id/issues')
  async getProjectIssues(@Param('id') projectId: string) {
    try {
      const issues = await this.projectsService.getProjectIssues(projectId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Project issues retrieved successfully',
        data: issues,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving project issues:', error);
      throw new HttpException(
        'Failed to retrieve project issues',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get a specific issue by ID' })
  @ApiResponse({ status: 200, description: 'Issue retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Issue or project not found' })
  @ApiBearerAuth()
  @Get(':id/issues/:issueId')
  async getIssue(
    @Param('id') projectId: string,
    @Param('issueId') issueId: string,
  ) {
    try {
      const issue = await this.projectsService.getIssue(projectId, issueId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Issue retrieved successfully',
        data: issue,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving issue:', error);
      throw new HttpException(
        'Failed to retrieve issue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update an issue' })
  @ApiResponse({ status: 200, description: 'Issue updated successfully' })
  @ApiResponse({ status: 404, description: 'Issue or project not found' })
  @ApiBearerAuth()
  @Patch(':id/issues/:issueId')
  async updateIssue(
    @Param('id') projectId: string,
    @Param('issueId') issueId: string,
    @Body() updateIssueDto: UpdateIssueDto,
  ) {
    try {
      const issue = await this.projectsService.updateIssue(
        projectId,
        issueId,
        updateIssueDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Issue updated successfully',
        data: issue,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating issue:', error);
      throw new HttpException(
        'Failed to update issue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Delete an issue' })
  @ApiResponse({ status: 200, description: 'Issue deleted successfully' })
  @ApiResponse({ status: 404, description: 'Issue or project not found' })
  @ApiBearerAuth()
  @Delete(':id/issues/:issueId')
  async deleteIssue(
    @Param('id') projectId: string,
    @Param('issueId') issueId: string,
  ) {
    try {
      const issue = await this.projectsService.deleteIssue(projectId, issueId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Issue deleted successfully',
        data: issue,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting issue:', error);
      throw new HttpException(
        'Failed to delete issue',
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

  // Add expense routes

  @ApiOperation({ summary: 'Create a new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Post(':id/expenses')
  @UseInterceptors(
    FilesInterceptor('receipts', 5, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/expenses';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, uuidv4() + ext);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async createExpense(
    @Param('id') projectId: string,
    @Body() createExpenseDto: CreateExpenseDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const createdById = req.user?.sub;
      const receiptUrls =
        files?.map((f) => `/uploads/expenses/${f.filename}`) ?? [];
      const expense = await this.projectsService.createExpense(
        projectId,
        createExpenseDto,
        createdById,
        receiptUrls,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Expense created successfully',
        data: expense,
      };
    } catch (error) {
      console.error('Error creating expense:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new HttpException(
        'Failed to create expense',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get all expenses for a project' })
  @ApiResponse({
    status: 200,
    description: 'Project expenses retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiBearerAuth()
  @Get(':id/expenses')
  async getProjectExpenses(@Param('id') projectId: string) {
    try {
      const expenses = await this.projectsService.getProjectExpenses(projectId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Project expenses retrieved successfully',
        data: expenses,
      };
    } catch (error) {
      console.error('Error retrieving project expenses:', error);
      throw new HttpException(
        'Failed to retrieve project expenses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Get an expense by ID' })
  @ApiResponse({ status: 200, description: 'Expense retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Expense or project not found' })
  @ApiBearerAuth()
  @Get(':id/expenses/:expenseId')
  async getExpense(
    @Param('id') projectId: string,
    @Param('expenseId') expenseId: string,
  ) {
    try {
      const expense = await this.projectsService.getExpense(
        projectId,
        expenseId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Expense retrieved successfully',
        data: expense,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error retrieving expense:', error);
      throw new HttpException(
        'Failed to retrieve expense',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  @ApiResponse({ status: 404, description: 'Expense or project not found' })
  @ApiBearerAuth()
  @Patch(':id/expenses/:expenseId')
  @UseInterceptors(
    FilesInterceptor('receipts', 1, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/expenses';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, uuidv4() + ext);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async updateExpense(
    @Param('id') projectId: string,
    @Param('expenseId') expenseId: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const updatedById = req.user?.sub;
      const receiptUrls =
        files?.map((f) => `/uploads/expenses/${f.filename}`) ?? [];
      const expense = await this.projectsService.updateExpense(
        projectId,
        expenseId,
        updateExpenseDto,
        updatedById,
        receiptUrls,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Expense updated successfully',
        data: expense,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      console.error('Error updating expense:', error);
      throw new HttpException(
        'Failed to update expense',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  @ApiResponse({ status: 404, description: 'Expense or project not found' })
  @ApiBearerAuth()
  @Delete(':id/expenses/:expenseId')
  async deleteExpense(
    @Param('id') projectId: string,
    @Param('expenseId') expenseId: string,
  ) {
    try {
      await this.projectsService.deleteExpense(projectId, expenseId);
      return {
        statusCode: HttpStatus.OK,
        message: 'Expense deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Error deleting expense:', error);
      throw new HttpException(
        'Failed to delete expense',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
