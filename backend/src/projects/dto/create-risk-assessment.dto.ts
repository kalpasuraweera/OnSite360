import { IsString, IsNumber, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRiskAssessmentDto {
  @ApiProperty({
    description: 'Risk title/name',
    example: 'Weather delay risk for foundation work',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed risk description',
    example: 'Heavy rain season may delay foundation pouring and curing',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Risk category',
    example: 'Weather',
    enum: ['Safety', 'Financial', 'Schedule', 'Quality', 'Weather', 'Regulatory'],
  })
  @IsString()
  @IsIn(['Safety', 'Financial', 'Schedule', 'Quality', 'Weather', 'Regulatory'])
  category: string;

  @ApiProperty({
    description: 'Probability of risk occurring',
    example: 'Medium',
    enum: ['Low', 'Medium', 'High'],
  })
  @IsString()
  @IsIn(['Low', 'Medium', 'High'])
  probability: string;

  @ApiProperty({
    description: 'Impact severity if risk occurs',
    example: 'High',
    enum: ['Low', 'Medium', 'High', 'Critical'],
  })
  @IsString()
  @IsIn(['Low', 'Medium', 'High', 'Critical'])
  impact: string;

  @ApiProperty({
    description: 'Person responsible for managing this risk',
    example: 'Site Manager',
    required: false,
  })
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiProperty({
    description: 'Mitigation strategy',
    example: 'Schedule foundation work during dry season, prepare tenting equipment',
    required: false,
  })
  @IsOptional()
  @IsString()
  mitigation?: string;

  @ApiProperty({
    description: 'Contingency plan',
    example: 'Use rapid-setting concrete if weather window is limited',
    required: false,
  })
  @IsOptional()
  @IsString()
  contingency?: string;

  @ApiProperty({
    description: 'Due date for mitigation completion',
    example: '2024-02-15T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'Next review date',
    example: '2024-01-30T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @ApiProperty({
    description: 'Potential cost impact',
    example: 15000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({
    description: 'Potential schedule impact in days',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  schedule?: number;
}