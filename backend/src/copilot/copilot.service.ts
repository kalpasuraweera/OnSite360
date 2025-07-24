import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios, { AxiosResponse } from 'axios';
import {
  TextGenerationDto,
  TextGenerationResponseDto,
} from './dto/create-copilot.dto';
import {
  OllamaGenerateResponse,
  OllamaGenerateRequest,
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
  ): Promise<TextGenerationResponseDto> {
    const startTime = Date.now();
    const model = dto.model || this.defaultModel;

    try {
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
}
