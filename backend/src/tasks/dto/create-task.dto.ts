import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export class CreateTaskDto {
  @ApiProperty({
    description: 'Title of the task',
    example: 'Install electrical wiring in main building',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the task',
    example:
      'Install electrical wiring for the main building including outlets and lighting fixtures',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'ID of the project this task belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({
    description: 'ID of the user assigned to this task',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Status of the task',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
    default: TaskStatus.PENDING,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus = TaskStatus.PENDING;

  @ApiPropertyOptional({
    description: 'Priority level of the task',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority = TaskPriority.MEDIUM;

  @ApiPropertyOptional({
    description: 'Progress percentage (0-100)',
    example: 25,
    minimum: 0,
    maximum: 100,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number = 0;

  @ApiPropertyOptional({
    description: 'Estimated hours to complete the task',
    example: 8.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedHours?: number;

  @ApiPropertyOptional({
    description: 'Actual hours spent on the task',
    example: 6.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualHours?: number;

  @ApiPropertyOptional({
    description: 'Due date for the task',
    example: '2024-02-15T17:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Date when the task was started',
    example: '2024-02-01T09:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @ApiPropertyOptional({
    description: 'Date when the task was completed',
    example: '2024-02-10T17:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @ApiPropertyOptional({
    description: 'Tags associated with the task',
    example: ['electrical', 'priority', 'building-a'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Array of document IDs for attachments',
    example: [
      '123e4567-e89b-12d3-a456-426614174002',
      '123e4567-e89b-12d3-a456-426614174003',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  attachments?: string[];
}
