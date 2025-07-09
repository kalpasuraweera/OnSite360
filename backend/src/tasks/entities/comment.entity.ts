import { ApiProperty } from '@nestjs/swagger';

export class Comment {
  @ApiProperty({
    description: 'Comment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  taskId: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  userId: string;

  @ApiProperty({
    description: 'Comment content',
    example: 'This task is progressing well.',
  })
  content: string;

  @ApiProperty({
    description: 'Created date',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated date',
    example: '2024-01-01T00:00:00Z',
  })
  updatedAt: Date;

  // Relations
  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };
}
