import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import { ConfigService } from '@nestjs/config'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import { PrismaClient } from '@prisma/client'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './utils/http-exception-filter'
import { Environment } from './config/env.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService<Environment>)

  app.enableCors({
    credentials: true,
    origin: true,
  })
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

  const PORT = configService.get<number>('PORT')!

  await app.listen(PORT)
}
bootstrap()
