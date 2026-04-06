import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins/admin'
import { bearer } from 'better-auth/plugins/bearer'
import { tryGetContext } from 'hono/context-storage'

import * as schema from '../db/schema'

import { db } from './db'
import { env } from './env'
import { logger } from './logger'

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
  rateLimit: {
    enabled: false,
  },
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: true,
    },
  },
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  plugins: [bearer(), admin()],
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
