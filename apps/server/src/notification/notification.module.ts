import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LogModule } from 'src/log/log.module'

import { NotificationConsumerService } from './notification.consumer'
import { NotificationController } from './notification.controller'
import { NotificationProducerService } from './notification.producer'
import { NotificationService } from './notification.service'
import { NOTIFICATION_QUEUE } from './notification.utils'

@Module({
  imports: [
    ConfigModule,
    LogModule,
    BullModule.registerQueueAsync({
      name: NOTIFICATION_QUEUE,
      useFactory: () => ({
        name: NOTIFICATION_QUEUE,
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationProducerService,
    NotificationConsumerService,
  ],
  exports: [NotificationProducerService],
})
export class NotificationModule {}
