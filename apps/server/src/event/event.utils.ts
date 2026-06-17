import { eq } from 'drizzle-orm'

import { eventParticipant } from '../db/schema'
import { db } from '../lib/db'
import { logger } from '../lib/logger'
import { notificationQueue } from '../notification/notification.worker'

export type EventNotificationType =
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'EVENT_RESCHEDULED'
  | 'EVENT_CANCELLED'

export async function queueEventNotifications({
  eventId,
  eventName,
  ownerId,
  notificationType,
  performedById,
  metadata = {},
}: {
  eventId: string
  eventName: string
  ownerId: string
  notificationType: EventNotificationType
  performedById: string
  metadata?: Record<string, unknown>
}) {
  const component = 'queueEventNotifications'

  const participants = await db
    .select({ userId: eventParticipant.userId })
    .from(eventParticipant)
    .where(eq(eventParticipant.eventId, eventId))

  const recipientIds = new Set([
    ownerId,
    ...participants.map((participant) => participant.userId),
  ])
  recipientIds.delete(performedById)

  const notificationMetadata = {
    eventId,
    eventName,
    performedById,
    ...metadata,
  }

  await Promise.all(
    [...recipientIds].map(async (userId) => {
      try {
        await notificationQueue.add(notificationType, {
          type: 'CREATE_NOTIFICATION',
          userId,
          notificationType,
          notificationMetadata,
        })
      } catch (error) {
        logger.error(
          { component, error, eventId, userId, notificationType },
          'failed to queue event notification',
        )
      }
    }),
  )
}
