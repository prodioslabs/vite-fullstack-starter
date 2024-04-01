import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as joi from 'joi'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      validationSchema: joi.object({
        JWT_SECRET: joi.string(),
        JWT_EXPIRES_IN: joi.string(),
      }),
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
