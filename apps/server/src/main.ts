import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './utils/http-exception-filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors()
  app.useGlobalFilters(new HttpExceptionFilter())
  app.use(cookieParser())

  await app.listen(3000)
}
bootstrap()
