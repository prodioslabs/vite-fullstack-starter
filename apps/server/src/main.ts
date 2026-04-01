import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { env } from './env/env'
import { LogService } from './log/log.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  })
  const logService = app.get(LogService)
  app.useLogger(logService)
  await app.listen(env.PORT)

  function gracefulShutdown() {
    logService.log('gracefully shutting down')
    app
      .close()
      .then(() => {
        logService.log('gracefully shut down')
      })
      .catch((error) => {
        logService.error(error, 'error shutting down')
      })
  }

  process.addListener('SIGTERM', gracefulShutdown)
  process.addListener('SIGINT', gracefulShutdown)
}
bootstrap()
