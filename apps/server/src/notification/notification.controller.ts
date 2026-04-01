import { Controller, UseGuards } from '@nestjs/common'
import { Implement, implement } from '@orpc/nest'
import { contract } from '@repo/contracts'
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth'

import { NotificationService } from './notification.service'

@UseGuards(AuthGuard)
@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Implement(contract.notifications.getUnreadNotificationCount)
  getUnreadNotificationCount(@Session() session: UserSession) {
    return implement(contract.notifications.getUnreadNotificationCount).handler(
      async () => {
        return this.notificationService.getUnreadNotificationCount(session.user)
      },
    )
  }

  @Implement(contract.notifications.findAll)
  findAll(@Session() session: UserSession) {
    return implement(contract.notifications.findAll).handler(async () => {
      return this.notificationService.findAll(session.user)
    })
  }

  @Implement(contract.notifications.markAsRead)
  markAsRead(@Session() session: UserSession) {
    return implement(contract.notifications.markAsRead).handler(
      async ({ input }) => {
        return this.notificationService.markAsRead(input, session.user)
      },
    )
  }

  @Implement(contract.notifications.markAllAsRead)
  markAllAsRead(@Session() session: UserSession) {
    return implement(contract.notifications.markAllAsRead).handler(async () => {
      return this.notificationService.markAllAsRead(session.user)
    })
  }
}
