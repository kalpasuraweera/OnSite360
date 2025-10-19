import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsObject,
  IsUrl,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string; // e.g., "Residential", "Commercial", "Industrial"

  // @IsNumber()
  @IsOptional()
  budget?: number;

  // @IsNumber()
  @IsOptional()
  squareFeet?: number;

  @IsString()
  @IsOptional()
  location?: string;

  // @IsObject()
  @IsOptional()
  coordinates?: { lat: number; lng: number };

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsUrl()
  @IsOptional()
  featuredImageUrl?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  // @IsArray()
  @IsOptional()
  // @ValidateNested({ each: true })
  // @Type(() => ProjectUserDto)
  users?: string; // Array of users to assign to the project
}

export class ProjectUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  projectRole?: string; // e.g., "Project Manager", "Worker", "Supervisor"

  @IsNumber()
  @IsOptional()
  accessLevel?: number; // 1-3, defaults to 1
}
