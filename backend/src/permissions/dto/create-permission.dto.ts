import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
    example: "['chart', 'table', 'form']",
    description: 'Optional list of components on the page',
    required: false,
  })
  @IsString()
  @IsOptional()
  components?: string;
}
