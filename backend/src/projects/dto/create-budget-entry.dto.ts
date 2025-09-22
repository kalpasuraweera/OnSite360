import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetEntryDto {
  @ApiProperty({
    description: 'Budget category',
    example: 'Labor',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Actual spent amount',
    example: 5000.0,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Budgeted amount for this category',
    example: 7000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  budgeted?: number;

  @ApiProperty({
    description: 'Description of the budget entry',
    example: 'Monthly labor costs for construction team',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Date of the budget entry',
    example: '2024-01-15T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Includes overtime compensation',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}