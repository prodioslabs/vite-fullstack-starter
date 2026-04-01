import { oc } from '@orpc/contract'
import { z } from 'zod'

const baseNotificationSchema = z.object({
  receiverId: z.string(),
})

export const createNotificationSchema = z.discriminatedUnion('type', [
  baseNotificationSchema.extend({
    type: z.literal('TEST'),
    metadata: z.object({
      formId: z.string(),
      applicationId: z.string(),
      serviceName: z.string(),
    }),
  }),
])

export const notificationSchema = createNotificationSchema.and(
  z.object({
    id: z.string(),
    readAt: z.date().nullable(),
  }),
)

export const notificationContract = {
  getUnreadNotificationCount: oc
    .output(z.object({ count: z.number() }))
    .route({ method: 'GET', path: '/notifications/unread' }),

  findAll: oc
    .output(z.array(notificationSchema))
    .route({ method: 'GET', path: '/notifications' }),

  markAsRead: oc
    .input(z.object({ id: z.string() }))
    .output(notificationSchema)
    .route({ method: 'POST', path: '/notifications/mark-as-read' }),

  markAllAsRead: oc
    .input(z.object({}))
    .output(z.object({ success: z.boolean() }))
    .route({ method: 'POST', path: '/notifications/mark-all-as-read' }),
}
