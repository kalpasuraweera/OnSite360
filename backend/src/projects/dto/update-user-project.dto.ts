import { PartialType } from '@nestjs/swagger';
import { AssignUserToProjectDto } from './assign-user-to-project.dto';

export class UpdateUserProjectDto extends PartialType(AssignUserToProjectDto) {}
