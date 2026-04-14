import { app } from './app'
import { env } from './lib/env'
import { logger } from './lib/logger'

export function bootstrapHTTPServer() {
  const server = Bun.serve({
    fetch: app.fetch,
    port: env.PORT,
  })
  logger.info(`server started at ${server.url}`)

  return async function destory() {
    logger.info('stopping server')
    return server.stop().then(() => {
      logger.info('server stopped')
    })
  }
}
