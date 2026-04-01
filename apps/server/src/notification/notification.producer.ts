import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Injectable } from '@nestjs/common'
import { createNotificationSchema } from '@repo/contracts'
import { Queue } from 'bullmq'
import * as z from 'zod'

import { NOTIFICATION_QUEUE } from './notification.utils'

@Injectable()
export class NotificationProducerService {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
  ) {}

  async create(body: z.infer<typeof createNotificationSchema>) {
    const response = createNotificationSchema.safeParse(body)
    if (!response.success) {
      throw new BadRequestException(
        'Received invalid data for creating notification!',
      )
    }

    await this.notificationQueue.add('new-notification', response.data)
    return body
  }
}
