import { getConnInfo } from 'hono/bun'
import { createMiddleware } from 'hono/factory'
import type { Logger } from 'pino'

export const loggerMiddlware = (logger: Logger) =>
  createMiddleware(async (c, next) => {
    const url = new URL(c.req.url)
    const pathname = url.pathname
    const method = c.req.method
    const origin =
      c.req.header('Origin') ?? c.req.header('Referer') ?? 'unknown'
    const userAgent = c.req.header('User-Agent') ?? 'unknown'
    const remote = getConnInfo(c).remote
    const requestId = c.get('requestId')

    logger.info(
      { method, pathname, origin, userAgent, remote, requestId },
      'request',
    )

    const start = Date.now()
    await next()
    const status = c.res.status
    const duration = Date.now() - start

    logger.info(
      {
        status,
        duration,
        requestId,
      },
      'response',
    )
  })
