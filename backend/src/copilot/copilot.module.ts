import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CopilotService } from './copilot.service';
import { CopilotController } from './copilot.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [CopilotController],
  providers: [CopilotService],
  exports: [CopilotService],
})
export class CopilotModule {}
