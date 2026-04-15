import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer } from 'better-auth/plugins/bearer'
import { tryGetContext } from 'hono/context-storage'

import * as schema from '../db/schema'

import { db } from './db'
import { env } from './env'
import { logger } from './logger'
import { mailer } from './mailers'

const trustedOrigins: string[] = []
if (env.CORS_ORIGIN.startsWith('https')) {
  trustedOrigins.push(env.CORS_ORIGIN)
  // TLS termination might happen before reaching the app server
  // so we also allow the HTTP version of the origin
  trustedOrigins.push(env.CORS_ORIGIN.replace('https', 'http'))
} else {
  trustedOrigins.push(env.CORS_ORIGIN)
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  rateLimit: { enabled: false },
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ token, user }) => {
      const url = new URL('/reset-password', env.APP_BASE_URL)
      url.searchParams.set('token', token)
      url.searchParams.set('email', user.email)

      const emailContent = [
        `Hello ${user.email},\n`,
        'To reset your password, please click the link below:',
        `${url.toString()}\n`,
        'If you did not request a password reset, please ignore this email.',
        'Thank you!',
      ].join('\n')

      await mailer.sendMail({
        to: user.email,
        subject: 'Password Reset Request',
        text: emailContent,
      })
    },
  },
  advanced: { defaultCookieAttributes: { sameSite: 'lax', secure: true } },
  user: {
    additionalFields: {
      role: { type: ['USER'], required: true, defaultValue: 'USER' },
    },
  },
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  plugins: [bearer()],
  logger: {
    disabled: false,
    disableColors: false,
    level: 'debug',
    log: (level, message, meta) => {
      const requestId = tryGetContext()?.var.requestId ?? 'unknown'
      logger[level]({ requestId, ...(meta ?? {}) }, message)
    },
  },
})

export type Auth = typeof auth

export type AuthSession = NonNullable<
  Awaited<ReturnType<Auth['api']['getSession']>>
>
export type Session = AuthSession['session']
export type User = AuthSession['user']
