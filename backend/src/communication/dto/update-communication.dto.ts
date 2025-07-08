import { PartialType } from '@nestjs/swagger';
import {
  CreateThreadDto,
  CreateMessageDto,
  CreateRFIDto,
} from './create-communication.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateThreadDto extends PartialType(CreateThreadDto) {}

export class UpdateMessageDto extends PartialType(CreateMessageDto) {}

export class UpdateRFIDto extends PartialType(CreateRFIDto) {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  response?: string;
}
