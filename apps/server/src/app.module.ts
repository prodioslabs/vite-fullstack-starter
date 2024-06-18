import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as joi from 'joi'
import { HealthModule } from './health/health.module'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      validationSchema: joi.object({
        SESSION_SECRET: joi.string(),
        SESSION_COOKIE_MAX_AGE: joi.number(),
      }),
    }),
    HealthModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
