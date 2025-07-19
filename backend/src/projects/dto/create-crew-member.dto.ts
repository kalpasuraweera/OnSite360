import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsArray,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateCrewMemberDto {
  @ApiProperty({
    description: 'Name of the crew member',
    example: 'John Smith',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Role of the crew member',
    example: 'Foreman',
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    description: 'Phone number of the crew member',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Email address of the crew member',
    example: 'john.smith@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Skills of the crew member',
    example: ['Carpentry', 'Electrical', 'Plumbing'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({
    description: 'Whether the crew member is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Hire date of the crew member',
    example: '2024-01-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  hireDate?: string;
}
