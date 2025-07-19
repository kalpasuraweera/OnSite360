import { PartialType } from '@nestjs/swagger';
import { CreateProjectAttendanceDto } from './create-project-attendance.dto';

export class UpdateProjectAttendanceDto extends PartialType(
  CreateProjectAttendanceDto,
) {}
