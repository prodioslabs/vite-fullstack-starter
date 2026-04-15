import * as z from 'zod'

import { notification } from '../db/schema'
import { db } from '../lib/db'
import { logger } from '../lib/logger'
import { createQueue, createWorker } from '../lib/mq'

export const notificationJobDataSchema = z.object({
  type: z.literal('CREATE_NOTIFICATION'),
  userId: z.string(),
  notificationType: z.string(),
  notificationMetadata: z.object().loose(),
})

export type NotificationJobData = z.infer<typeof notificationJobDataSchema>

export const notificationQueue =
  createQueue<NotificationJobData>('NOTIFICATION_QUEUE')

export function createNotificationWorker() {
  return createWorker<NotificationJobData>(
    notificationQueue.name,
    async function processNotification({ data }) {
      const component = 'processNotification'

      logger.info(
        { component, userId: data.userId, type: data.type, app: 'worker' },
        'creating notification',
      )
      try {
        const notificationCreated = await db
          .insert(notification)
          .values({
            receiverId: data.userId,
            metadata: data.notificationMetadata,
            type: data.notificationType,
          })
          .returning({ id: notification.id })
        if (notificationCreated.length === 0) {
          throw new Error('could not create notification')
        }
        logger.info(
          {
            component,
            userId: data.userId,
            type: data.type,
            notificationCreatedId: notificationCreated[0]!.id,
          },
          'notification created',
        )
      } catch (error) {
        logger.error(
          { component, error, userId: data.userId, type: data.type },
          'error creating notification',
        )
      }
    },
  )
}
