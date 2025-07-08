import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  projectId: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  participantIds?: string[];
}

export class AddUserToThreadDto {
  @IsUUID()
  userId: string;
}

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsUUID()
  threadId: string;
}

export class CreateRFIDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  answer?: string;

  @IsUUID()
  threadId: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  assigneeIds?: string[];
}
