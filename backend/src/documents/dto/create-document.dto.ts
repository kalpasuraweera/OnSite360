import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Project ID to which the document belongs' })
  projectId: string;

  @ApiProperty({ description: 'Document name (original file name)' })
  name: string;

  @ApiProperty({ description: 'Document type', example: 'Drawing' })
  type: string;

  @ApiPropertyOptional({ description: 'Further categorization' })
  category?: string;

  @ApiPropertyOptional({ description: 'Document version', default: '1.0' })
  version?: string;

  @ApiPropertyOptional({ description: 'Description of the document' })
  description?: string;

  @ApiPropertyOptional({ description: 'Tags for the document', type: [String] })
  tags?: string[];
}
