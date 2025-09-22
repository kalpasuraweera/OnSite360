import { PartialType } from '@nestjs/swagger';
import { CreateRiskAssessmentDto } from './create-risk-assessment.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRiskAssessmentDto extends PartialType(CreateRiskAssessmentDto) {
  @ApiProperty({
    description: 'Risk status',
    example: 'Open',
    enum: ['Open', 'Mitigated', 'Accepted', 'Closed'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['Open', 'Mitigated', 'Accepted', 'Closed'])
  status?: string;
}