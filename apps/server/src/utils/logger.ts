import { Logger as NestLogger } from '@nestjs/common'

export class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  log(message: string) {
    NestLogger.log(message, this.context)
  }

  info(message: string) {
    NestLogger.log(`ℹℹ️ : ${message}`, this.context)
  }

  success(message: string) {
    NestLogger.log(`✅✅: ${message}`, this.context)
  }

  error(message: string, error?: unknown) {
    NestLogger.error(`❌❌: ${message}`, this.context, error)
  }
}
