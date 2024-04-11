import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as joi from 'joi'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { SessionModule } from './session/session.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      validationSchema: joi.object({
        SESSION_SECRET: joi.string(),
        SESSION_COOKIE_MAX_AGE: joi.string(),
      }),
    }),
    UserModule,
    AuthModule,
    SessionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
