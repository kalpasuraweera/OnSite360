import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIssueDto {
  @ApiProperty({ description: 'Title of the issue' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed description of the issue' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Category of the issue',
    enum: [
      'Safety',
      'Quality',
      'Delay',
      'Equipment',
      'Environmental',
      'Material',
      'Other',
    ],
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Severity level of the issue',
    enum: ['Low', 'Medium', 'High', 'Critical'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['Low', 'Medium', 'High', 'Critical'])
  severity: string;

  @ApiPropertyOptional({ description: 'Location where the issue occurred' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ description: 'Name of the person who reported the issue' })
  @IsString()
  @IsNotEmpty()
  reportedBy: string;

  @ApiPropertyOptional({ description: 'User IDs to tag for notifications' })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  taggedUserIds?: string[];

  @ApiPropertyOptional({ description: 'Due date for resolving the issue' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Document IDs for attachments' })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  attachmentIds?: string[];
}
