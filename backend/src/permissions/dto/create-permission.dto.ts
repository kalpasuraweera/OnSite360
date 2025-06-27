import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'dashboard-123',
    description: 'The unique identifier of the page',
  })
  @IsString()
  @IsNotEmpty()
  pageId: string;

  @ApiProperty({
    example: 'Dashboard',
    description: 'The name of the page',
  })
  @IsString()
  @IsNotEmpty()
  pageName: string;

  @ApiProperty({
    example: ['component1', 'component2'],
    description: 'Optional list of components on the page',
    required: false,
  })
  @IsArray()
  @IsOptional()
  components?: string[];
}
