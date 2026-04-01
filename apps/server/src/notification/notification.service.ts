import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { notificationSchema } from '@repo/contracts'
import { type UserSession } from '@thallesp/nestjs-better-auth'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from 'src/db'
import { notification } from 'src/db/schema'
import { LogService } from 'src/log/log.service'
import { formatErrorMessage } from 'src/utils/format'
import { z } from 'zod'

@Injectable()
export class NotificationService {
  constructor(private readonly logger: LogService) {}

  async getUnreadNotificationCount(user: UserSession['user']) {
    try {
      const unreadNotifications = await db.$count(
        notification,
        and(eq(notification.receiverId, user.id), isNull(notification.readAt)),
      )

      return { count: unreadNotifications }
    } catch (error) {
      this.logger.error(
        `Error fetching unread notification count: ${formatErrorMessage(error)}`,
      )
      throw new InternalServerErrorException(
        'Failed to fetch unread notification count',
      )
    }
  }

  async findAll(user: UserSession['user']) {
    try {
      const notifications = await db.query.notification.findMany({
        where: eq(notification.receiverId, user.id),
        orderBy: (notification, { desc }) => [desc(notification.createdAt)],
      })

      const response = z.array(notificationSchema).safeParse(notifications)
      if (!response.success) {
        throw new BadRequestException('Invalid notifications data!')
      }

      return response.data
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

      this.logger.error(
        `Error fetching notifications: ${formatErrorMessage(error)}`,
      )
      throw new InternalServerErrorException('Failed to fetch notifications')
    }
  }

  async findById(id: string, user: UserSession['user']) {
    try {
      const notificationDoc = await db.query.notification.findFirst({
        where: and(
          eq(notification.id, id),
          eq(notification.receiverId, user.id),
        ),
      })

      if (!notificationDoc) {
        throw new NotFoundException('Notification not found!')
      }

      const response = notificationSchema.safeParse(notificationDoc)
      if (!response.success) {
        throw new InternalServerErrorException('Notification has invalid data!')
      }

      return response.data
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }

      this.logger.error(
        `Error finding notification by ID: ${formatErrorMessage(error)}`,
      )
      throw new InternalServerErrorException(
        'Failed to find notification by ID',
      )
    }
  }

  async markAsRead(body: { id: string }, user: UserSession['user']) {
    const notificationDoc = await this.findById(body.id, user)

    try {
      await db
        .update(notification)
        .set({ readAt: new Date() })
        .where(eq(notification.id, notificationDoc.id))

      return notificationDoc
    } catch (error) {
      this.logger.error(
        `Error marking notification as read: ${formatErrorMessage(error)}`,
      )
      throw new InternalServerErrorException(
        'Failed to mark notification as read',
      )
    }
  }

  async markAllAsRead(user: UserSession['user']) {
    try {
      await db
        .update(notification)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notification.receiverId, user.id),
            isNull(notification.readAt),
          ),
        )

      return { success: true }
    } catch (error) {
      this.logger.error(
        `Error marking all notifications as read: ${formatErrorMessage(error)}`,
      )
      throw new InternalServerErrorException(
        'Failed to mark all notifications as read',
      )
    }
  }
}
