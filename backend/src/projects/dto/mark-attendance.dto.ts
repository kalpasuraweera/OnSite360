import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceRecordDto {
  @ApiProperty({
    description: 'Crew member ID',
    example: 'cm-uuid-123',
  })
  @IsString()
  @IsNotEmpty()
  crewMemberId: string;

  @ApiProperty({
    description: 'Attendance status',
    example: 'PRESENT',
    enum: [
      'PRESENT',
      'ABSENT',
      'HALF_DAY',
      'LATE',
      'EARLY_DEPARTURE',
      'SICK_LEAVE',
      'VACATION',
      'HOLIDAY',
    ],
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'Check-in time',
    example: '2024-07-19T08:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  checkInTime?: string;

  @ApiProperty({
    description: 'Check-out time',
    example: '2024-07-19T17:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  checkOutTime?: string;

  @ApiProperty({
    description: 'Break duration in minutes',
    example: 60,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  breakDuration?: number;

  @ApiProperty({
    description: 'Total working hours',
    example: 8.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalHours?: number;

  @ApiProperty({
    description: 'Scheduled hours for the day',
    example: 8,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  scheduledHours?: number;

  @ApiProperty({
    description: 'Type of leave',
    example: 'SICK',
    enum: ['SICK', 'VACATION', 'PERSONAL', 'EMERGENCY', 'UNAUTHORIZED'],
    required: false,
  })
  @IsOptional()
  @IsString()
  leaveType?: string;

  @ApiProperty({
    description: 'Whether leave was pre-approved',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @ApiProperty({
    description: 'Specific work location',
    example: 'Building A - Floor 2',
    required: false,
  })
  @IsOptional()
  @IsString()
  workLocation?: string;

  @ApiProperty({
    description: 'Tasks performed',
    example: ['Concrete pouring', 'Steel installation'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tasks?: string[];

  @ApiProperty({
    description: 'Individual notes for this crew member',
    example: 'Arrived late due to traffic',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class MarkAttendanceDto {
  @ApiProperty({
    description: 'Attendance records for crew members',
    type: [AttendanceRecordDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  crewAttendance: AttendanceRecordDto[];
}
