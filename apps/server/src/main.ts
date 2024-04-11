import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'
import * as passport from 'passport'
import { ConfigService } from '@nestjs/config'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import { PrismaClient } from '@prisma/client'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './utils/http-exception-filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  app.enableCors()
  app.useGlobalFilters(new HttpExceptionFilter())
  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET')!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: parseInt(configService.get<string>('SESSION_COOKIE_MAX_AGE')!),
      },
      store: new PrismaSessionStore(new PrismaClient(), {
        // PrismaSessionStore will automatically remove expired sessions
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
      }),
    }),
  )

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(cookieParser())

  await app.listen(3000)
}
bootstrap()
