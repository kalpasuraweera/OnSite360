import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectPhaseDto {
  @ApiProperty({
    description: 'Name of the project phase',
    example: 'Foundation Work',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the project phase',
    example:
      'Complete foundation work including excavation and concrete pouring',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Start date of the phase',
    example: '2024-01-15T09:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of the phase',
    example: '2024-01-30T17:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Project ID this phase belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({
    description: 'Color code for the phase in hex format',
    example: '#3498db',
    pattern: '^#[0-9A-F]{6}$',
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Progress percentage (0-100)',
    example: 45,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({
    description: 'Parent phase ID for creating sub-phases',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class CreateScheduleEventDto {
  @ApiProperty({
    description: 'Title of the schedule event',
    example: 'Team Meeting',
    minLength: 1,
    maxLength: 150,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the schedule event',
    example: 'Weekly team meeting to discuss project progress',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Start date and time of the event',
    example: '2024-01-15T09:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date and time of the event',
    example: '2024-01-15T10:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Project ID this event belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  projectId: string;

  @ApiProperty({
    description: 'Type of the schedule event',
    example: 'MEETING',
    enum: ['MEETING', 'TASK', 'MILESTONE', 'INSPECTION', 'DELIVERY', 'OTHER'],
  })
  @IsString()
  @IsEnum(['MEETING', 'TASK', 'MILESTONE', 'INSPECTION', 'DELIVERY', 'OTHER'])
  type: string;

  @ApiPropertyOptional({
    description: 'Priority level of the event',
    example: 'HIGH',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: string;

  @ApiPropertyOptional({
    description: 'Location of the event',
    example: 'Conference Room A',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({
    description: 'Color code for the event in hex format',
    example: '#e74c3c',
    pattern: '^#[0-9A-F]{6}$',
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Whether this is an all-day event',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allDay?: boolean;

  @ApiPropertyOptional({
    description: 'User ID assigned to this event',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  assignedUserId?: string;
}

export class CreateDailyLogDto {
  @ApiProperty({
    description: 'Date of the daily log',
    example: '2024-01-15T00:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Project ID this log belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({
    description: 'Weather conditions',
    example: 'Sunny, 75°F',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  weather?: string;

  @ApiPropertyOptional({
    description: 'Overall notes for the day',
    example: 'Good progress on foundation work. No major issues.',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Work hours for the day',
    example: 8,
    minimum: 0,
    maximum: 24,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(24)
  workHours?: number;

  @ApiPropertyOptional({
    description: 'Number of workers present',
    example: 12,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  workersPresent?: number;
}

export class CreateDailyActivityDto {
  @ApiProperty({
    description: 'Description of the activity',
    example: 'Concrete pouring for foundation',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  activity: string;

  @ApiProperty({
    description: 'Daily log ID this activity belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  dailyLogId: string;

  @ApiPropertyOptional({
    description: 'Start time of the activity',
    example: '2024-01-15T09:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time of the activity',
    example: '2024-01-15T12:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Progress percentage (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({
    description: 'Activity status',
    example: 'IN_PROGRESS',
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the activity',
    example: 'Weather conditions were favorable',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Associated task ID (optional)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  taskId?: string;

  @ApiPropertyOptional({
    description: 'Location where activity took place',
    example: 'North Wing, 2nd Floor',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;
}
