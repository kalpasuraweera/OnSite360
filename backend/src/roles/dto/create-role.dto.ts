import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Admin',
    description: 'The unique name of the role',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: [
      { permissionId: 'permission-uuid-1', level: 1 },
      { permissionId: 'permission-uuid-2', level: 2 },
    ],
    description: 'Array of permissions with their access levels',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        permissionId: { type: 'string', format: 'uuid' },
        level: { type: 'integer' },
      },
    },
  })
  @IsArray()
  @IsOptional()
  permissions?: Array<{
    permissionId: string;
    level: number;
    availableComponents?: string[]; // Optional, can be used to specify components for the permission
  }>;
}
