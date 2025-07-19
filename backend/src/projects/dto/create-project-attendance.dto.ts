import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class CreateProjectAttendanceDto {
  @ApiProperty({
    description: 'Date for attendance marking (YYYY-MM-DD)',
    example: '2024-07-19',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Actual start time of work',
    example: '2024-07-19T08:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  actualStartTime?: string;

  @ApiProperty({
    description: 'Whether work was delayed',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  workDelayed?: boolean;

  @ApiProperty({
    description: 'Reason for delay if work was delayed',
    example: 'Weather conditions',
    required: false,
  })
  @IsOptional()
  @IsString()
  delayReason?: string;

  @ApiProperty({
    description: 'Delay duration in minutes',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  delayDuration?: number;

  @ApiProperty({
    description: 'Type of day',
    example: 'WORKDAY',
    enum: [
      'WORKDAY',
      'HOLIDAY',
      'WEEKEND',
      'WEATHER_DELAY',
      'NO_WORK_SCHEDULED',
    ],
    required: false,
    default: 'WORKDAY',
  })
  @IsOptional()
  @IsString()
  dayType?: string;

  @ApiProperty({
    description: 'Reason for day type (e.g., holiday name)',
    example: 'Independence Day',
    required: false,
  })
  @IsOptional()
  @IsString()
  dayTypeReason?: string;

  @ApiProperty({
    description: 'Whether work was scheduled for this day',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isWorkDay?: boolean;

  @ApiProperty({
    description: 'General notes for the day',
    example: 'Good weather, all crew members present',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
