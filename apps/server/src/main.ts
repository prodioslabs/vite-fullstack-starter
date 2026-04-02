import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { env, Environment } from './env/env'
import { LoggerService } from './logger/logger.service'
import { HttpExceptionFilter } from './utils/http-exception-filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  })
  const loggerService = app.get(LoggerService)
  app.useLogger(loggerService)

  const configService: ConfigService<Environment> = app.get(ConfigService)

  app.enableCors({
    credentials: true,
    origin: configService.get<string>('CORS_ORIGIN') ?? true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'captcha-solution',
      'captcha-problem',
      'x-csrf-token',
      'x-api-key',
    ],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  })

  app.useGlobalFilters(new HttpExceptionFilter())

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
