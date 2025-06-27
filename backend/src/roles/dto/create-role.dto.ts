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
      {
        permissionId: 'permission-uuid-1',
        level: 1,
        availableComponents: ['component1', 'component2'],
      },
      {
        permissionId: 'permission-uuid-2',
        level: 2,
        availableComponents: ['component3'],
      },
    ],
    description: 'Array of permissions with their access levels',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        permissionId: { type: 'string', format: 'uuid' },
        level: { type: 'integer' },
        availableComponents: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional list of components for the permission',
        },
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
