import { PartialType } from '@nestjs/swagger';
import { CreateCopilotDto } from './create-copilot.dto';

export class UpdateCopilotDto extends PartialType(CreateCopilotDto) {}
