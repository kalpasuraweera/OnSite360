import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class AssignProjectDto {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  projectRole?: string; // e.g., "Site Manager", "Foreman", "Supervisor", "Worker"

  @IsOptional()
  @IsString()
  accessLevel?: string; // "Read", "Write", "Admin"

  @IsOptional()
  @IsDateString()
  assignedDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  workSchedule?: string; // e.g., "Full-time", "Part-time", "Contractor"

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  assignedBy?: string; // User ID of who made the assignment
}
