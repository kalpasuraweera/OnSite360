import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class AssignUserToProjectDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  projectRole?: string; // e.g., "Site Manager", "Foreman", "Supervisor", "Worker"

  @IsNumber()
  @IsOptional()
  accessLevel?: number; // 0 = None, 1 = Read-only, 2 = Write, 3 = Admin

  @IsString()
  @IsOptional()
  workSchedule?: string; // e.g., "Full-time", "Part-time", "Contractor"

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
