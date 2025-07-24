import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TextGenerationDto {
  @ApiProperty({ description: 'Prompt for text generation' })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({
    description: 'Model to use for generation',
    default: 'llama3',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of tokens to generate',
    minimum: 1,
    maximum: 4096,
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4096)
  maxTokens?: number;

  @ApiPropertyOptional({
    description: 'Temperature for randomness (0.0 to 2.0)',
    minimum: 0.0,
    maximum: 2.0,
    default: 0.7,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(2.0)
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Whether to stream the response',
    default: false,
  })
  @IsOptional()
  stream?: boolean;

  @ApiPropertyOptional({
    description: 'Project context for the generation',
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}

export class TextGenerationResponseDto {
  @ApiProperty({ description: 'Generated text content' })
  response: string;

  @ApiProperty({ description: 'Model used for generation' })
  model: string;

  @ApiPropertyOptional({ description: 'Number of tokens used' })
  tokens?: number;

  @ApiPropertyOptional({ description: 'Generation duration in milliseconds' })
  duration?: number;

  @ApiProperty({ description: 'Timestamp of the response' })
  timestamp: Date;
}
