import { Hono } from 'hono'
import { getConnInfo } from 'hono/bun'
import { contextStorage } from 'hono/context-storage'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { requestId } from 'hono/request-id'
import { rateLimiter, RedisStore } from 'hono-rate-limiter'
import type { RedisValue } from 'ioredis'

import { authRouter } from './auth/auth.router'
import { captchaRouter } from './captcha/captcha.router'
import { fileRouter } from './file/file.router'
import { healthRouter } from './health/health.router'
import type { AppContext } from './lib/context'
import { env } from './lib/env'
import { logger } from './lib/logger'
import { redisClient } from './lib/redis'
import { getErrorMessage } from './lib/utils'
import { loggerMiddlware } from './middlewares/logger'

export const app = new Hono<{ Variables: AppContext }>()
  .onError(async (error, c) => {
    const requestId = c.get('requestId')
    if (error instanceof HTTPException) {
      const status = error.status ?? 500
      const errorMessage = error.message ?? getErrorMessage(error)
      logger.error(
        {
          status,
          errorMessage,
          requestId,
        },
        'HTTP exception occurred',
      )
      return c.json({ error: errorMessage }, status)
    }
    const errorMessage = getErrorMessage(error)
    logger.error(
      {
        errorMessage,
        requestId,
      },
      'unhandled exception occurred',
    )
    return c.json({ error: errorMessage }, 500)
  })
  .use(
    rateLimiter({
      windowMs: 15 * 60 * 1000,
      // limit each client to 100 requests per window
      limit: 10,
      keyGenerator: (c) =>
        c.req.header('x-forwarded-for') ?? getConnInfo(c).remote.address ?? '',
      store: new RedisStore({
        client: {
          decr(key) {
            return redisClient.decr(key)
          },
          del(key) {
            return redisClient.del(key)
          },
          scriptLoad(script) {
            return redisClient.script('LOAD', script) as Promise<string>
          },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          evalsha(sha1, keys, args) {
            const params = [...keys, ...args] as RedisValue[]
            return redisClient.evalsha(sha1, keys.length, ...params)
          },
        },
      }),
    }),
  )
  .use(contextStorage())
  .use(requestId())
  .use(loggerMiddlware(logger))
  .use(
    cors({
      origin: [env.CORS_ORIGIN],
      credentials: true,
      exposeHeaders: [
        'Content-Length',
        'Set-Cookie',
        'X-Captcha-Problem',
        'X-Captcha-Solution',
      ],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      allowHeaders: [
        'Content-Type',
        'Authorization',
        'X-Captcha-Problem',
        'X-Captcha-Solution',
      ],
    }),
  )
  .basePath('/api')
  .route('/auth', authRouter)
  .route('/health', healthRouter)
  .route('/file', fileRouter)
  .route('/captcha', captchaRouter)

export type App = typeof app
