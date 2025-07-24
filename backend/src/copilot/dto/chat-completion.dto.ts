import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export class ChatMessageDto {
  @ApiProperty({ enum: MessageRole, description: 'Role of the message sender' })
  @IsEnum(MessageRole)
  role: MessageRole;

  @ApiProperty({ description: 'Content of the message' })
  @IsString()
  content: string;
}

export class ChatCompletionDto {
  @ApiProperty({
    type: [ChatMessageDto],
    description: 'Array of messages in the conversation',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiPropertyOptional({
    description: 'Model to use for completion',
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
    description: 'Project context for the conversation',
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Session ID for continuing a conversation',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Whether to stream the response',
    default: false,
  })
  @IsOptional()
  stream?: boolean;
}

export class ChatCompletionResponseDto {
  @ApiProperty({ description: 'Generated response content' })
  content: string;

  @ApiProperty({ description: 'Session ID for the conversation' })
  sessionId: string;

  @ApiProperty({ description: 'Model used for generation' })
  model: string;

  @ApiPropertyOptional({ description: 'Number of tokens used' })
  tokens?: number;

  @ApiPropertyOptional({ description: 'Generation duration in milliseconds' })
  duration?: number;

  @ApiProperty({ description: 'Timestamp of the response' })
  timestamp: Date;
}
