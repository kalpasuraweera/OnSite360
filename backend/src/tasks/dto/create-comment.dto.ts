import { IsString, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'ID of the task to comment on',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  taskId: string;

  @ApiProperty({
    description: 'Content of the comment',
    example: 'This task is progressing well. We should be done by Friday.',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
}
