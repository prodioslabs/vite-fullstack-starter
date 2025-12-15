import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { z } from 'zod'
import { notification, contract } from '@repo/contract'
import { PrismaService } from '../prisma/prisma.service'
import { UserWithoutSensitiveData } from '../user/user.type'

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUnreadNotificationCount(
    user: UserWithoutSensitiveData,
  ): Promise<z.infer<(typeof contract.notifications.getUnreadNotificationCount.responses)['200']>> {
    const unreadNotifications = await this.prisma.notification.count({
      where: { readAt: { isSet: false }, receiverId: user.id },
    })

    return {
      status: 200,
      body: { count: unreadNotifications },
    }
  }

  async findAll(
    user: UserWithoutSensitiveData,
  ): Promise<
    | z.infer<(typeof contract.notifications.findAll.responses)['200']>
    | z.infer<(typeof contract.notifications.findAll.responses)['400']>
  > {
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
    body: z.infer<typeof contract.notifications.markAsRead.body>,
    user: UserWithoutSensitiveData,
  ): Promise<
    | z.infer<(typeof contract.notifications.markAsRead.responses)['200']>
    | z.infer<(typeof contract.notifications.markAsRead.responses)['404']>
  > {
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

  async markAllAsRead(
    user: UserWithoutSensitiveData,
  ): Promise<z.infer<(typeof contract.notifications.markAllAsRead.responses)['200']>> {
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
