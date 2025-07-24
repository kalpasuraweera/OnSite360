import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GenerationType, GenerationStatus, MessageRole } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
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
import {
  OllamaGenerateResponse,
  OllamaEmbeddingResponse,
  OllamaGenerateRequest,
  OllamaEmbeddingRequest,
} from './types/ollama.types';

@Injectable()
export class CopilotService {
  private readonly logger = new Logger(CopilotService.name);
  private readonly llmServiceUrl: string;
  private readonly defaultModel: string;
  private readonly embeddingModel: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.llmServiceUrl = this.configService.get<string>(
      'LLM_SERVICE_URL',
      'http://localhost:11434/api',
    );
    this.defaultModel = this.configService.get<string>(
      'LLM_MODEL_NAME',
      'llama3',
    );
    this.embeddingModel = this.configService.get<string>(
      'EMBEDDING_MODEL_NAME',
      'nomic-embed-text',
    );
  }

  async generateText(
    dto: TextGenerationDto,
    userId: string,
  ): Promise<TextGenerationResponseDto> {
    const startTime = Date.now();
    const model = dto.model || this.defaultModel;

    try {
      // Log the generation request
      const generation = await this.prisma.lLMGeneration.create({
        data: {
          userId,
          type: GenerationType.TEXT_GENERATION,
          model,
          prompt: dto.prompt,
          status: GenerationStatus.PENDING,
        },
      });

      // Prepare request for Ollama API
      const requestData: OllamaGenerateRequest = {
        model,
        prompt: dto.prompt,
        stream: false,
        options: {
          num_predict: dto.maxTokens || 1000,
          temperature: dto.temperature || 0.7,
        },
      };

      // Call Ollama API using axios
      const response: AxiosResponse<OllamaGenerateResponse> = await axios.post(
        `${this.llmServiceUrl}/generate`,
        requestData,
      );

      const result = response.data;
      const duration = Date.now() - startTime;

      // Update generation record
      await this.prisma.lLMGeneration.update({
        where: { id: generation.id },
        data: {
          response: result.response,
          tokens: result.eval_count || null,
          duration,
          status: GenerationStatus.COMPLETED,
        },
      });

      return {
        response: result.response,
        model,
        tokens: result.eval_count,
        duration,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Text generation failed:', error);
      throw new HttpException(
        'Text generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async chatCompletion(
    dto: ChatCompletionDto,
    userId: string,
  ): Promise<ChatCompletionResponseDto> {
    const startTime = Date.now();
    const model = dto.model || this.defaultModel;

    try {
      // Get or create chat session
      let sessionId = dto.sessionId;
      if (!sessionId) {
        const session = await this.prisma.chatSession.create({
          data: {
            userId,
            projectId: dto.projectId || null,
            title: this.generateChatTitle(dto.messages),
          },
        });
        sessionId = session.id;
      }

      // Save user message
      const userMessage = dto.messages[dto.messages.length - 1];
      await this.prisma.chatMessage.create({
        data: {
          sessionId,
          role: userMessage.role.toUpperCase() as MessageRole,
          content: userMessage.content,
        },
      });

      // Log the generation request
      const generation = await this.prisma.lLMGeneration.create({
        data: {
          userId,
          type: GenerationType.CHAT_COMPLETION,
          model,
          prompt: this.formatMessagesForPrompt(dto.messages),
          status: GenerationStatus.PENDING,
        },
      });

      // Format messages for Ollama
      const prompt = this.formatMessagesForPrompt(dto.messages);

      // Prepare request for Ollama API
      const requestData: OllamaGenerateRequest = {
        model,
        prompt,
        stream: false,
        options: {
          num_predict: dto.maxTokens || 1000,
          temperature: dto.temperature || 0.7,
        },
      };

      // Call Ollama API using axios
      const response: AxiosResponse<OllamaGenerateResponse> = await axios.post(
        `${this.llmServiceUrl}/generate`,
        requestData,
      );

      const result = response.data;
      const duration = Date.now() - startTime;

      // Save assistant response
      await this.prisma.chatMessage.create({
        data: {
          sessionId,
          role: MessageRole.ASSISTANT,
          content: result.response,
          metadata: {
            model,
            tokens: result.eval_count,
            duration,
          },
        },
      });

      // Update generation record
      await this.prisma.lLMGeneration.update({
        where: { id: generation.id },
        data: {
          response: result.response,
          tokens: result.eval_count || null,
          duration,
          status: GenerationStatus.COMPLETED,
        },
      });

      return {
        content: result.response,
        sessionId,
        model,
        tokens: result.eval_count,
        duration,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Chat completion failed:', error);
      throw new HttpException(
        'Chat completion failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateEmbeddings(
    dto: EmbeddingDto,
    userId: string,
  ): Promise<EmbeddingResponseDto> {
    const startTime = Date.now();
    const model = dto.model || this.embeddingModel;

    try {
      const inputs = Array.isArray(dto.input) ? dto.input : [dto.input];
      const embeddings: number[][] = [];

      for (const input of inputs) {
        // Log the generation request
        const generation = await this.prisma.lLMGeneration.create({
          data: {
            userId,
            type: GenerationType.EMBEDDING,
            model,
            prompt: input,
            status: GenerationStatus.PENDING,
          },
        });

        // Prepare request for Ollama API
        const requestData: OllamaEmbeddingRequest = {
          model,
          prompt: input,
        };

        // Call Ollama API for embeddings using axios
        const response: AxiosResponse<OllamaEmbeddingResponse> =
          await axios.post(`${this.llmServiceUrl}/embeddings`, requestData);

        const result = response.data;
        embeddings.push(result.embedding);

        // Update generation record
        await this.prisma.lLMGeneration.update({
          where: { id: generation.id },
          data: {
            response: JSON.stringify(result.embedding),
            status: GenerationStatus.COMPLETED,
          },
        });
      }

      const duration = Date.now() - startTime;

      return {
        embeddings,
        model,
        duration,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Embedding generation failed:', error);
      throw new HttpException(
        'Embedding generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async embedDocument(
    dto: DocumentEmbeddingDto,
    userId: string,
  ): Promise<{ success: boolean; chunksCreated: number }> {
    try {
      // Get document content
      const document = await this.prisma.document.findUnique({
        where: { id: dto.documentId },
      });

      if (!document) {
        throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
      }

      // For now, we'll use the document name as content
      // In a real implementation, you'd extract text from the file
      const content = `Document: ${document.name}\nDescription: ${document.description || 'No description'}\nType: ${document.type}`;

      // Split content into chunks
      const chunks = this.splitTextIntoChunks(
        content,
        dto.chunkSize || 1000,
        dto.overlap || 200,
      );

      let chunksCreated = 0;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Generate embedding for chunk
        const embeddingResponse = await this.generateEmbeddings(
          { input: chunk, model: dto.model },
          userId,
        );

        // Save embedding to database
        await this.prisma.documentEmbedding.create({
          data: {
            documentId: dto.documentId,
            chunkIndex: i,
            content: chunk,
            embedding: embeddingResponse.embeddings[0],
            metadata: {
              model: dto.model || this.embeddingModel,
              chunkSize: dto.chunkSize || 1000,
              overlap: dto.overlap || 200,
            },
          },
        });

        chunksCreated++;
      }

      return { success: true, chunksCreated };
    } catch (error) {
      this.logger.error('Document embedding failed:', error);
      throw new HttpException(
        'Document embedding failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async semanticSearch(
    dto: SemanticSearchDto,
    _userId: string,
  ): Promise<SemanticSearchResponseDto> {
    const startTime = Date.now();

    try {
      // Generate embedding for search query (for future implementation)
      // const queryEmbedding = await this.generateEmbeddings(
      //   { input: dto.query },
      //   userId,
      // );

      // This is a simplified implementation - in production you'd use a vector database
      // For now, we'll just return mock results
      const results = [
        {
          documentId: 'mock-doc-1',
          documentName: 'Sample Document',
          documentType: 'Drawing',
          content: 'This is a sample document content that matches your query.',
          score: 0.85,
          chunkIndex: 0,
          metadata: { type: 'Drawing' },
        },
      ];

      const duration = Date.now() - startTime;

      return {
        results,
        query: dto.query,
        total: results.length,
        duration,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Semantic search failed:', error);
      throw new HttpException(
        'Semantic search failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getChatHistory(sessionId: string, userId: string) {
    const session = await this.prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    if (!session) {
      throw new HttpException('Chat session not found', HttpStatus.NOT_FOUND);
    }

    return session;
  }

  async getUserChatSessions(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      include: {
        project: {
          select: { id: true, name: true },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  private formatMessagesForPrompt(
    messages: Array<{ role: string; content: string }>,
  ): string {
    return (
      messages
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n') + '\nASSISTANT:'
    );
  }

  private generateChatTitle(
    messages: Array<{ role: string; content: string }>,
  ): string {
    const firstUserMessage = messages.find(
      (m) => m.role === 'user' || m.role === 'USER',
    );
    if (firstUserMessage) {
      return (
        firstUserMessage.content.slice(0, 50) +
        (firstUserMessage.content.length > 50 ? '...' : '')
      );
    }
    return 'New Chat';
  }

  private splitTextIntoChunks(
    text: string,
    chunkSize: number,
    overlap: number,
  ): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = start + chunkSize;
      chunks.push(text.slice(start, end));
      start = end - overlap;
    }

    return chunks;
  }
}
