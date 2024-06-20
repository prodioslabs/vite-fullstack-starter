import { z } from 'zod'
import { client } from './client'
import { error } from '../lib/utils'

const baseNotificationSchema = z.object({
  receiverId: z.string(),
})

export const createNotificationSchema = z.discriminatedUnion('type', [
  baseNotificationSchema.extend({
    type: z.literal('TEST'),
    metadata: z.object({ formId: z.string(), applicationId: z.string(), serviceName: z.string() }),
  }),
])

export const notification = createNotificationSchema.and(
  z.object({
    id: z.string(),
    readAt: z.date().nullable(),
  }),
)

export const notificationContract = client.router(
  {
    getUnreadNotificationCount: {
      path: '/unread',
      method: 'GET',
      responses: {
        200: z.object({ count: z.number() }),
      },
    },
    findAll: {
      path: '/',
      method: 'GET',
      responses: {
        200: z.array(notification),
        400: error,
      },
    },
    markAsRead: {
      path: '/mark-as-read',
      method: 'POST',
      body: z.object({ id: z.string() }),
      responses: {
        200: notification,
        404: error,
      },
    },
    markAllAsRead: {
      path: '/mark-all-as-read',
      method: 'POST',
      body: z.object({}),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
  { pathPrefix: '/notifications' },
)
