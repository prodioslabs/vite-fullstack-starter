import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BullModule } from '@nestjs/bull'
import { HealthModule } from './health/health.module'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { Environment, validationSchema } from './config/env.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      validationSchema,
      isGlobal: true,
    }),
    HealthModule,
    UserModule,
    AuthModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Environment>) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          username: configService.get('REDIS_USERNAME'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
