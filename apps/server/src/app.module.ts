import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConditionalModule, ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { MailerModule, MailerService } from '@nestjs-modules/mailer'
import { AuthModule } from '@thallesp/nestjs-better-auth'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { ClsModule } from 'nestjs-cls'
import { v4 } from 'uuid'

import { db } from './db'
import * as schema from './db/schema'
import { Environment, envSchema } from './env/env'
import { FileModule } from './file/file.module'
import { LoggerModule } from './logger/logger.module'
import { LoggerService } from './logger/logger.service'
import { NotificationModule } from './notification/notification.module'
import { PASSWORD_RESET_TOKEN_EXPIRY } from './utils/constants'

@Module({
  imports: [
    ClsModule.forRoot({
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request): string => {
          const headerRequestId = req.headers['x-request-id']
          if (headerRequestId && typeof headerRequestId === 'string') {
            return headerRequestId
          }
          return v4()
        },
      },
    }),
    LoggerModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Environment>) => {
        const email = configService.get<string>('SMTP_USER_NAME')
        const password = configService.get<string>('SMTP_PASSWORD')
        if (!email || !password) {
          throw new Error('SMTP_USER_NAME or SMTP_PASSWORD is not set')
        }

        return {
          transport: {
            service: 'gmail',
            auth: { user: email, pass: password },
          },
        }
      },
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      validate: (config) => envSchema.parse(config),
      isGlobal: true,
    }),
    AuthModule.forRootAsync({
      imports: [ConfigModule, MailerModule, LoggerModule],
      inject: [ConfigService, MailerService, LoggerService],
      useFactory: (
        configService: ConfigService<Environment>,
        mailerService: MailerService,
        loggerService: LoggerService,
      ) => {
        const appBaseUrl = configService.get<string>('APP_BASE_URL')
        if (!appBaseUrl) {
          throw new Error('APP_BASE_URL is not set')
        }

        return {
          auth: betterAuth({
            basePath: '/auth',
            database: drizzleAdapter(db, {
              provider: 'pg',
              schema,
            }),
            emailAndPassword: {
              enabled: true,
              resetPasswordTokenExpiresIn: PASSWORD_RESET_TOKEN_EXPIRY,
              revokeSessionsOnPasswordReset: true,
              sendResetPassword: async ({ token, user }) => {
                const url = new URL('/reset-password', appBaseUrl)
                url.searchParams.set('token', token)

                const emailContent = [
                  'Hi,\n',
                  'We received a request to reset the password for your account associated with this email address.',
                  `\nClick the link below to set a new password:\n${url.toString()}\n`,
                  'This link will expire in 15 minutes.',
                  "\nIf you didn't request a password reset, you can safely ignore this email - your password won't be changed.",
                  '\nThanks,\nThe Team',
                ].join('\n')

                await mailerService.sendMail({
                  to: user.email,
                  subject: 'Password Reset Request',
                  text: emailContent,
                })
              },
            },
            user: {
              additionalFields: {
                role: {
                  type: 'string',
                  required: true,
                  defaultValue: 'USER',
                },
              },
            },
            trustedOrigins: [appBaseUrl],
            secret: configService.get<string>('BETTER_AUTH_SECRET'),
            logger: {
              log(level, message, ...args) {
                switch (level) {
                  case 'debug': {
                    loggerService.debug(message, ...args)
                    break
                  }
                  case 'error': {
                    loggerService.error(message, ...args)
                    break
                  }
                  case 'warn': {
                    loggerService.warn(message, ...args)
                    break
                  }
                  case 'info':
                  default: {
                    loggerService.log(message, ...args)
                  }
                }
              },
            },
          }),
        }
      },
      disableGlobalAuthGuard: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Environment>) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          username: configService.get('REDIS_USERNAME'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
    }),
    ConditionalModule.registerWhen(ScheduleModule.forRoot(), 'CRON_ENABLED'),
    NotificationModule,
    FileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
