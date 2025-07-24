import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SemanticSearchDto {
  @ApiProperty({ description: 'Query text for semantic search' })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Project ID to limit search scope',
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Number of results to return',
    minimum: 1,
    maximum: 50,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Similarity threshold (0.0 to 1.0)',
    minimum: 0.0,
    maximum: 1.0,
    default: 0.7,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(1.0)
  threshold?: number;

  @ApiPropertyOptional({
    description: 'Document types to include in search',
    type: [String],
  })
  @IsOptional()
  documentTypes?: string[];
}

export class SearchResultDto {
  @ApiProperty({ description: 'Document ID' })
  documentId: string;

  @ApiProperty({ description: 'Document name' })
  documentName: string;

  @ApiProperty({ description: 'Document type' })
  documentType: string;

  @ApiProperty({ description: 'Matching content chunk' })
  content: string;

  @ApiProperty({ description: 'Similarity score' })
  score: number;

  @ApiProperty({ description: 'Chunk index in document' })
  chunkIndex: number;

  @ApiPropertyOptional({ description: 'Document metadata' })
  metadata?: Record<string, any>;
}

export class SemanticSearchResponseDto {
  @ApiProperty({
    description: 'Search results',
    type: [SearchResultDto],
  })
  results: SearchResultDto[];

  @ApiProperty({ description: 'Query that was searched' })
  query: string;

  @ApiProperty({ description: 'Total number of results found' })
  total: number;

  @ApiPropertyOptional({ description: 'Search duration in milliseconds' })
  duration?: number;

  @ApiProperty({ description: 'Timestamp of the search' })
  timestamp: Date;
}
