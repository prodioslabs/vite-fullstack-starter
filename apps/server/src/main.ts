import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { env } from './env/env'
import { LoggerService } from './logger/logger.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  })
  const loggerService = app.get(LoggerService)
  app.useLogger(loggerService)
  await app.listen(env.PORT)

  function gracefulShutdown() {
    loggerService.log('gracefully shutting down')
    app
      .close()
      .then(() => {
        loggerService.log('gracefully shut down')
      })
      .catch((error) => {
        loggerService.error(error, 'error shutting down')
      })
  }

  process.addListener('SIGTERM', gracefulShutdown)
  process.addListener('SIGINT', gracefulShutdown)
}
bootstrap()
