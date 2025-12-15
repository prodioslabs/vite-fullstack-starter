import { Controller, UseGuards } from '@nestjs/common'
import { TsRestHandler } from '@ts-rest/nest'
import { contract } from '@repo/contract'
import { NotificationService } from './notification.service'
import { AuthorizationGuard } from '../auth/auth.guard'
import { User } from '../auth/auth.decorator'
import { UserWithoutSensitiveData } from '../user/user.type'

@UseGuards(AuthorizationGuard)
@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @TsRestHandler(contract.notifications.getUnreadNotificationCount)
  getUnreadNotificationCount(@User() user: UserWithoutSensitiveData) {
    return async () => this.notificationService.getUnreadNotificationCount(user)
  }

  @TsRestHandler(contract.notifications.findAll)
  findAll(@User() user: UserWithoutSensitiveData) {
    return async () => this.notificationService.findAll(user)
  }

  @TsRestHandler(contract.notifications.markAsRead)
  markAsRead(@User() user: UserWithoutSensitiveData) {
    return async ({ body }) => this.notificationService.markAsRead(body, user)
  }

  @TsRestHandler(contract.notifications.markAllAsRead)
  markAllAsRead(@User() user: UserWithoutSensitiveData) {
    return async () => this.notificationService.markAllAsRead(user)
  }
}
