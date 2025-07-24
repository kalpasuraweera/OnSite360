import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmbeddingDto {
  @ApiProperty({
    description: 'Text or array of texts to generate embeddings for',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  input: string | string[];

  @ApiPropertyOptional({
    description: 'Model to use for embedding generation',
    default: 'nomic-embed-text',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Document ID if embedding a document',
  })
  @IsOptional()
  @IsString()
  documentId?: string;
}

export class EmbeddingResponseDto {
  @ApiProperty({
    description: 'Generated embeddings',
    type: 'array',
    items: {
      type: 'array',
      items: { type: 'number' },
    },
  })
  embeddings: number[][];

  @ApiProperty({ description: 'Model used for embedding generation' })
  model: string;

  @ApiPropertyOptional({ description: 'Number of tokens processed' })
  tokens?: number;

  @ApiPropertyOptional({ description: 'Generation duration in milliseconds' })
  duration?: number;

  @ApiProperty({ description: 'Timestamp of the response' })
  timestamp: Date;
}

export class DocumentEmbeddingDto {
  @ApiProperty({ description: 'Document ID to embed' })
  @IsString()
  documentId: string;

  @ApiPropertyOptional({
    description: 'Model to use for embedding generation',
    default: 'nomic-embed-text',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Chunk size for splitting large documents',
    default: 1000,
  })
  @IsOptional()
  chunkSize?: number;

  @ApiPropertyOptional({
    description: 'Overlap between chunks',
    default: 200,
  })
  @IsOptional()
  overlap?: number;
}
