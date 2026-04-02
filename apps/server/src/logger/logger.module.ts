import { Module } from '@nestjs/common'
import { ClsModule } from 'nestjs-cls'

import { LoggerService } from './logger.service'

@Module({
  imports: [ClsModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
