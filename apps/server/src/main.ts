import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'
import * as passport from 'passport'
import { ConfigService } from '@nestjs/config'
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
    }),
  )

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(cookieParser())

  await app.listen(3000)
}
bootstrap()
