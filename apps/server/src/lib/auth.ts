import { render } from '@react-email/render'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer } from 'better-auth/plugins/bearer'
import { tryGetContext } from 'hono/context-storage'

import * as schema from '../db/schema'
import ResetPasswordEmail from '../emails/reset-password-email'

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
      try {
        const url = new URL('/reset-password', env.APP_BASE_URL)
        url.searchParams.set('token', token)
        url.searchParams.set('email', user.email)

        const html = await render(
          ResetPasswordEmail({ email: user.email, resetUrl: url.toString() }),
        )

        await mailer.sendMail({
          from: env.SMTP_USER,
          to: user.email,
          subject: 'Reset your password',
          html,
        })
      } catch {
        throw new Error('Failed to send reset password email')
      }
    },
  },
  advanced: { defaultCookieAttributes: { sameSite: 'lax', secure: true } },
  user: {
    additionalFields: {
      role: {
        type: ['USER', 'OFFICER', 'SUPER_ADMIN'],
        required: true,
        defaultValue: 'USER',
      },
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
