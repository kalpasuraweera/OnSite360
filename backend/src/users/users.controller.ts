import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @ApiOperation({ summary: 'Get projects for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'User projects retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth()
  @Get(':id/projects')
  getUserProjects(@Param('id') id: string) {
    return this.usersService.getUserProjects(id);
  }

  // New: GET /users/:id/notifications
  @Get(':id/notifications')
  async getNotifications(@Param('id') id: string) {
    return this.usersService.getNotifications(id);
  }

  // New: PATCH /users/:id/notifications/:notificationId/read
  @Patch(':id/notifications/:notificationId/read')
  async markNotificationRead(
    @Param('id') id: string,
    @Param('notificationId') notificationId: string,
  ) {
    const updated = await this.usersService.markNotificationRead(
      id,
      notificationId,
    );
    if (!updated) {
      return {
        success: false,
        message: 'Notification not found or not owned by user',
      };
    }
    return { success: true, notification: updated };
  }
}
