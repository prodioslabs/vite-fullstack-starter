import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { z } from 'zod'
import { createNotificationSchema } from '@repo/contract'
import { PrismaService } from '../prisma/prisma.service'
import { NOTIFICATION_QUEUE } from './notification.utils'
import { Logger } from '../utils/logger'

@Processor(NOTIFICATION_QUEUE)
export class NotificationConsumerService {
  private readonly logger = new Logger(NotificationConsumerService.name)

  constructor(private readonly prisma: PrismaService) {}

  @Process('new-notification')
  async createNewNotification(job: Job<z.infer<typeof createNotificationSchema>>) {
    this.logger.info('Send a new notification')

    try {
      await this.prisma.notification.create({
        data: {
          type: job.data.type,
          receiverId: job.data.receiverId,
          metadata: job.data.metadata,
        },
      })

      this.logger.success('Notification sent successfully!')
    } catch {
      this.logger.error('Something went wrong while sending notification!')
    }
  }
}
