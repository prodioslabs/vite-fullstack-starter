import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bull'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from '../prisma/prisma.module'
import { NOTIFICATION_QUEUE } from './notification.utils'
import { Environment } from '../config/env.config'
import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'
import { NotificationProducerService } from './notification.producer'
import { NotificationConsumerService } from './notification.consumer'

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueueAsync({
      name: NOTIFICATION_QUEUE,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<Environment>) => ({
        name: NOTIFICATION_QUEUE,
        defaultJobOptions: {
          timeout: configService.get('JOB_TIMEOUT_MS'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationProducerService, NotificationConsumerService],
  exports: [NotificationProducerService],
})
export class NotificationModule {}
