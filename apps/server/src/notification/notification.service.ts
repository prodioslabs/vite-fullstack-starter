import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { z } from 'zod'
import { notification } from '@repo/contract'
import { PrismaService } from '../prisma/prisma.service'
import { UserWithoutSensitiveData } from '../user/user.type'
import { NotificationRequestShapes, NotificationResponseShapes } from './notification.request'

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUnreadNotificationCount(
    user: UserWithoutSensitiveData,
  ): Promise<NotificationResponseShapes['getUnreadNotificationCount']> {
    const unreadNotifications = await this.prisma.notification.count({
      where: { readAt: { isSet: false }, receiverId: user.id },
    })

    return {
      status: 200,
      body: { count: unreadNotifications },
    }
  }

  async findAll(user: UserWithoutSensitiveData): Promise<NotificationResponseShapes['findAll']> {
    const notifications = await this.prisma.notification.findMany({
      where: { receiverId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    const response = z.array(notification).safeParse(notifications)
    if (!response.success) {
      return {
        status: 400,
        body: { error: 'Invalid notifications data!' },
      }
    }

    return {
      status: 200,
      body: response.data,
    }
  }

  async findById(id: string, user: UserWithoutSensitiveData) {
    const notificationDoc = await this.prisma.notification.findFirst({
      where: { id, receiverId: user.id },
    })

    if (!notificationDoc) {
      throw new NotFoundException('Notification not found!')
    }

    const response = notification.safeParse(notificationDoc)
    if (!response.success) {
      throw new InternalServerErrorException('Notification has invalid data!')
    }

    return response.data
  }

  async markAsRead(
    body: NotificationRequestShapes['markAsRead']['body'],
    user: UserWithoutSensitiveData,
  ): Promise<NotificationResponseShapes['markAsRead']> {
    const notification = await this.findById(body.id, user)

    if (!notification) {
      return {
        status: 404,
        body: { error: 'Notification not found!' },
      }
    }

    await this.prisma.notification.update({
      where: { id: notification.id },
      data: { readAt: new Date() },
    })

    return {
      status: 200,
      body: notification,
    }
  }

  async markAllAsRead(user: UserWithoutSensitiveData): Promise<NotificationResponseShapes['markAllAsRead']> {
    await this.prisma.notification.updateMany({
      where: { receiverId: user.id, readAt: { isSet: false } },
      data: { readAt: new Date() },
    })

    return {
      status: 200,
      body: { success: true },
    }
  }
}
