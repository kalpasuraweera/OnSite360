import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Task {
  @ApiProperty({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  projectId: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Install electrical wiring',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Install electrical wiring for the main building',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Assignee ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  assigneeId?: string;

  @ApiProperty({ description: 'Task status', example: 'Pending' })
  status: string;

  @ApiProperty({ description: 'Task priority', example: 'Medium' })
  priority: string;

  @ApiProperty({ description: 'Progress percentage', example: 25 })
  progress: number;

  @ApiPropertyOptional({ description: 'Estimated hours', example: 8.5 })
  estimatedHours?: number;

  @ApiPropertyOptional({ description: 'Actual hours', example: 6.5 })
  actualHours?: number;

  @ApiPropertyOptional({
    description: 'Due date',
    example: '2024-02-15T17:00:00Z',
  })
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Started date',
    example: '2024-02-01T09:00:00Z',
  })
  startedAt?: Date;

  @ApiPropertyOptional({
    description: 'Completed date',
    example: '2024-02-10T17:00:00Z',
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Tags',
    example: ['electrical', 'priority'],
  })
  tags: string[];

  @ApiProperty({ description: 'Created date', example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date', example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;

  // Relations
  @ApiPropertyOptional({ description: 'Project information' })
  project?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({ description: 'Assignee information' })
  assignee?: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };

  @ApiPropertyOptional({ description: 'Task attachments' })
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];

  @ApiPropertyOptional({ description: 'Task comments' })
  comments?: {
    id: string;
    content: string;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName?: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }[];
}
