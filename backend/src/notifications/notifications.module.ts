import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';

// Minimal module to expose NotificationsService for DI
@Module({
  providers: [
    NotificationsService,
    // PrismaService is used by the notifications service; if you already have a PrismaModule that exports PrismaService,
    // replace this with `imports: [PrismaModule]` and remove PrismaService from providers.
    PrismaService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
