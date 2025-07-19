import { PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateIssueDto } from './create-issue.dto';

export class UpdateIssueDto extends PartialType(CreateIssueDto) {
  @ApiPropertyOptional({ description: 'Title of the issue' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Detailed description of the issue' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
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
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Severity level of the issue',
    enum: ['Low', 'Medium', 'High', 'Critical'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['Low', 'Medium', 'High', 'Critical'])
  severity?: string;

  @ApiPropertyOptional({
    description: 'Status of the issue',
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['Open', 'In Progress', 'Resolved', 'Closed'])
  status?: string;

  @ApiPropertyOptional({ description: 'Location where the issue occurred' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Name of the person who reported the issue',
  })
  @IsString()
  @IsOptional()
  reportedBy?: string;

  @ApiPropertyOptional({ description: 'User IDs to tag for notifications' })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  taggedUserIds?: string[];

  @ApiPropertyOptional({ description: 'Due date for resolving the issue' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Resolution description' })
  @IsString()
  @IsOptional()
  resolution?: string;

  @ApiPropertyOptional({ description: 'Document IDs for attachments' })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  attachmentIds?: string[];
}
