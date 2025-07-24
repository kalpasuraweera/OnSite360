import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CopilotService } from './copilot.service';
import {
  ChatCompletionDto,
  ChatCompletionResponseDto,
  TextGenerationDto,
  TextGenerationResponseDto,
  EmbeddingDto,
  EmbeddingResponseDto,
  DocumentEmbeddingDto,
  SemanticSearchDto,
  SemanticSearchResponseDto,
} from './dto/create-copilot.dto';
import { AuthGuard } from '../auth/auth.guard';

interface AuthRequest extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@ApiTags('copilot')
@Controller('copilot')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CopilotController {
  constructor(private readonly copilotService: CopilotService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate text using LLM',
    description:
      'Generate text using the configured LLM model (Ollama API compatible)',
  })
  @ApiResponse({
    status: 200,
    description: 'Text generated successfully',
    type: TextGenerationResponseDto,
  })
  async generateText(
    @Body() dto: TextGenerationDto,
    @Request() req: AuthRequest,
  ): Promise<TextGenerationResponseDto> {
    return this.copilotService.generateText(dto, req.user.sub);
  }

  @Post('chat/completions')
  @ApiOperation({
    summary: 'Chat completion',
    description: 'Generate chat completion with conversation history',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat completion generated successfully',
    type: ChatCompletionResponseDto,
  })
  async chatCompletion(
    @Body() dto: ChatCompletionDto,
    @Request() req: AuthRequest,
  ): Promise<ChatCompletionResponseDto> {
    return this.copilotService.chatCompletion(dto, req.user.sub);
  }

  @Post('embeddings')
  @ApiOperation({
    summary: 'Generate embeddings',
    description: 'Generate vector embeddings for text input',
  })
  @ApiResponse({
    status: 200,
    description: 'Embeddings generated successfully',
    type: EmbeddingResponseDto,
  })
  async generateEmbeddings(
    @Body() dto: EmbeddingDto,
    @Request() req: AuthRequest,
  ): Promise<EmbeddingResponseDto> {
    return this.copilotService.generateEmbeddings(dto, req.user.sub);
  }

  @Post('documents/:documentId/embed')
  @ApiOperation({
    summary: 'Embed document',
    description:
      'Generate embeddings for a document and store them for semantic search',
  })
  @ApiResponse({
    status: 200,
    description: 'Document embedded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        chunksCreated: { type: 'number' },
      },
    },
  })
  async embedDocument(
    @Param('documentId') documentId: string,
    @Body() dto: Omit<DocumentEmbeddingDto, 'documentId'>,
    @Request() req: AuthRequest,
  ) {
    return this.copilotService.embedDocument(
      { ...dto, documentId },
      req.user.sub,
    );
  }

  @Post('search/semantic')
  @ApiOperation({
    summary: 'Semantic search',
    description: 'Search documents using semantic similarity',
  })
  @ApiResponse({
    status: 200,
    description: 'Search completed successfully',
    type: SemanticSearchResponseDto,
  })
  async semanticSearch(
    @Body() dto: SemanticSearchDto,
    @Request() req: AuthRequest,
  ): Promise<SemanticSearchResponseDto> {
    return this.copilotService.semanticSearch(dto, req.user.sub);
  }

  @Get('chat/sessions')
  @ApiOperation({
    summary: 'Get user chat sessions',
    description: 'Get all chat sessions for the current user',
  })
  async getChatSessions(@Request() req: AuthRequest) {
    return this.copilotService.getUserChatSessions(req.user.sub);
  }

  @Get('chat/sessions/:sessionId')
  @ApiOperation({
    summary: 'Get chat history',
    description: 'Get full chat history for a specific session',
  })
  async getChatHistory(
    @Param('sessionId') sessionId: string,
    @Request() req: AuthRequest,
  ) {
    return this.copilotService.getChatHistory(sessionId, req.user.sub);
  }
}
