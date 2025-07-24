import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CopilotService } from './copilot.service';
import {
  TextGenerationDto,
  TextGenerationResponseDto,
} from './dto/create-copilot.dto';

@ApiTags('copilot')
@Controller('copilot')
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
  ): Promise<TextGenerationResponseDto> {
    return this.copilotService.generateText(dto);
  }
}
