import { zValidator } from '@hono/zod-validator'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as z from 'zod'

import { authMiddleware } from '../auth/auth.middleware'
import { notification } from '../db/schema'
import { db } from '../lib/db'

export const notificationRouter = new Hono()
  .get('/count', authMiddleware, async function getNotificationsCount(c) {
    const user = c.get('user')

    const count = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(notification)
      .where(
        and(eq(notification.receiverId, user.id), isNull(notification.readAt)),
      )
      .then((row) => row[0])

    if (!count) {
      throw new HTTPException(500, {
        message: 'Error getting unread notifications count',
      })
    }

    return c.json({ count: count.count })
  })
  .get(
    '/',
    authMiddleware,
    zValidator(
      'query',
      z.object({
        limit: z.coerce.number().optional().default(20),
        offset: z.coerce.number().optional().default(0),
      }),
    ),
    async function getAllNotifications(c) {
      const user = c.get('user')

      const { limit, offset } = c.req.valid('query')

      const notifications = await db
        .select()
        .from(notification)
        .where(eq(notification.receiverId, user.id))
        .orderBy(desc(notification.createdAt))
        .limit(limit)
        .offset(offset)

      return c.json({ notifications })
    },
  )
  .post(
    '/mark-read',
    authMiddleware,
    zValidator('json', z.object({ notificationId: z.uuid() })),
    async function markNotificationAsRead(c) {
      const user = c.get('user')

      const { notificationId } = c.req.valid('json')

      const updatedNotification = await db
        .update(notification)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notification.receiverId, user.id),
            eq(notification.id, notificationId),
            isNull(notification.readAt),
          ),
        )
        .returning({ id: notification.id })

      if (updatedNotification.length === 0) {
        throw new HTTPException(404, { message: 'Notification not found' })
      }

      return c.json({ success: true })
    },
  )
  .post(
    '/mark-all-read',
    authMiddleware,
    async function markAllNotificationsAsRead(c) {
      const user = c.get('user')

      const updatedNotifications = await db
        .update(notification)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notification.receiverId, user.id),
            isNull(notification.readAt),
          ),
        )
        .returning({ id: notification.id })

      return c.json({
        success: true,
        updatedNotificationsCount: updatedNotifications.length,
      })
    },
  )
