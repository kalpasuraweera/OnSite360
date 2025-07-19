import { PartialType } from '@nestjs/swagger';
import { CreateCrewMemberDto } from './create-crew-member.dto';

export class UpdateCrewMemberDto extends PartialType(CreateCrewMemberDto) {}
