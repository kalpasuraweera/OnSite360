import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 1500.5 })
  amount: number;

  @ApiProperty({ required: false, example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ required: false, example: 'Materials' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false, example: 'ABC Supplies' })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  isReimbursable?: boolean;
}
