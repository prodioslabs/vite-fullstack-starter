import { Hono } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { requestId } from 'hono/request-id'

import { fileRouter } from './file/file.router'
import { healthRouter } from './health/health.router'
import { auth } from './lib/auth'
import type { AppContext } from './lib/context'
import { env } from './lib/env'
import { logger } from './lib/logger'
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
  .use(contextStorage())
  .use(requestId())
  .use(loggerMiddlware(logger))
  .use(
    cors({
      origin: [env.CORS_ORIGIN],
      credentials: true,
      exposeHeaders: ['Content-Length', 'Set-Cookie'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .basePath(env.BASE_PATH)
  .route('health', healthRouter)
  .on(['POST', 'GET'], 'auth/*', (c) => {
    return auth.handler(c.req.raw)
  })
  .route('file', fileRouter)

export type App = typeof app
