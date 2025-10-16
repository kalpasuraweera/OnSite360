import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a notification for a user and optionally send email/push.
   * - userId: ID of the recipient user
   * - title: short title
   * - description: optional detailed text
   * - options: { sendEmail?, sendPush?, time? }
   *
   * Returns the created notification record.
   */
  async sendNotification(
    userId: string,
    title: string,
    description?: string,
    options?: { sendEmail?: boolean; sendPush?: boolean; time?: Date | string },
  ) {
    const time = options?.time ? new Date(options.time) : new Date();

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        description,
        time,
        isRead: false,
      },
    });

    // Placeholder: integrate real email/push providers here.
    if (options?.sendEmail) {
      // TODO: call an email service to deliver the notification via email.
      this.logger.log(
        `sendEmail requested for user=${userId} notification=${notification.id}`,
      );
    }
    if (options?.sendPush) {
      // TODO: call push notification provider (FCM/APNs/etc).
      this.logger.log(
        `sendPush requested for user=${userId} notification=${notification.id}`,
      );
    }

    return notification;
  }
}
