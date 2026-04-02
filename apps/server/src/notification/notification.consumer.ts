import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger, UnsupportedMediaTypeException } from '@nestjs/common'
import { createNotificationSchema } from '@repo/contracts'
import { Job } from 'bullmq'
import { z } from 'zod'

import { db } from '../db'
import { notification } from '../db/schema'
import { formatErrorMessage } from '../utils/format'

import { NOTIFICATION_QUEUE } from './notification.utils'

@Processor(NOTIFICATION_QUEUE)
export class NotificationConsumerService extends WorkerHost {
  private readonly logger = new Logger(NotificationConsumerService.name)

  constructor() {
    super()
  }

  async process(job: Job<z.infer<typeof createNotificationSchema>>) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`)

    try {
      switch (job.name) {
        case 'new-notification':
          return await this.createNewNotification(job)
        default:
          this.logger.warn(`Unknown job type: ${job.name}`)
          throw new UnsupportedMediaTypeException(
            `Unsupported job type: ${job.name}`,
          )
      }
    } catch (error) {
      this.logger.error(
        `Error processing job ${job.id}: ${formatErrorMessage(error)}`,
      )
      throw error
    }
  }

  private async createNewNotification(
    job: Job<z.infer<typeof createNotificationSchema>>,
  ) {
    this.logger.log('Send a new notification')

    try {
      await db.insert(notification).values({
        type: job.data.type,
        receiverId: job.data.receiverId,
        metadata: job.data.metadata,
      })

      this.logger.log('Notification sent successfully!')
    } catch (error) {
      this.logger.error(
        `Something went wrong while sending notification: ${formatErrorMessage(error)}`,
      )
    }
  }
}
