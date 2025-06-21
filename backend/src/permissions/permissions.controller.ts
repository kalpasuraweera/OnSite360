import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiBearerAuth()
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    // Convert components to a valid JSON value before passing it to the service
    return this.permissionsService.createPermission({
      ...createPermissionDto,
      components: createPermissionDto.components || [],
    });
  }

  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.permissionsService.getAllPermissions();
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.getPermissionById(id);
  }

  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updatePermission(id, updatePermissionDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.deletePermission(id);
  }
}
