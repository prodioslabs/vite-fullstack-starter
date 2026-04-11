import { app } from './app'
import { env } from './lib/env'
import { logger } from './lib/logger'

export function bootstrapHTTPServer() {
  const server = Bun.serve({
    fetch: app.fetch,
    port: env.PORT,
    // disabling idleTimeout temporarily, as it resets connection
    // when streaming large files
    // ideally we should be able to call server.timeout(req, 0)
    // TODO: figure out how to implement this hono
    idleTimeout: 0,
  })
  logger.info(`server started at ${server.url}`)

  return async function destory() {
    logger.info('stopping server')
    return server.stop().then(() => {
      logger.info('server stopped')
    })
  }
}
