import { ApiProperty } from '@nestjs/swagger';

export class Document {
  @ApiProperty()
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ required: false, nullable: true })
  category?: string | null;

  @ApiProperty({ default: '1.0' })
  version: string;

  @ApiProperty({ required: false, nullable: true })
  size?: number | null;

  @ApiProperty({ required: false, nullable: true })
  mimeType?: string | null;

  @ApiProperty({ required: false, nullable: true })
  uploadedById?: string | null;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ type: [String], nullable: true })
  tags: string[] | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
