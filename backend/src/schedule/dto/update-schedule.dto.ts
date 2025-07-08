import { PartialType } from '@nestjs/swagger';
import {
  CreateProjectPhaseDto,
  CreateScheduleEventDto,
  CreateDailyLogDto,
  CreateDailyActivityDto,
} from './create-schedule.dto';

export class UpdateProjectPhaseDto extends PartialType(CreateProjectPhaseDto) {}

export class UpdateScheduleEventDto extends PartialType(
  CreateScheduleEventDto,
) {}

export class UpdateDailyLogDto extends PartialType(CreateDailyLogDto) {}

export class UpdateDailyActivityDto extends PartialType(
  CreateDailyActivityDto,
) {}
