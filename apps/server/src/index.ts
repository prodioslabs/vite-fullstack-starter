import { bootstrapCronJobs } from './cron'
import { env } from './lib/env'
import { logger } from './lib/logger'
import { bootstrapHTTPServer } from './server'
import { bootstrapWorkers } from './worker'

type DestroyFn = () => Promise<unknown> | unknown

async function start() {
  const destroyFns: DestroyFn[] = []

  if (env.ENABLE_CRON) {
    destroyFns.push(bootstrapCronJobs())
    logger.info('bootstrapped cron jobs')
  }

  if (env.ENABLE_QUEUE_WORKERS) {
    destroyFns.push(bootstrapWorkers())
    logger.info('bootstrapped workers')
  }

  if (env.ENABLE_HTTP_SERVER) {
    destroyFns.push(bootstrapHTTPServer())
    logger.info('bootstrapped HTTP server')
  }

  // isShuttingDown guard is used to prevent duplication of SIGINT events
  // when the workers are being closed using worker.close() in the
  // destroy function returned by bootstrapWorkers, this gracefulShutdown method
  // is getting called twice in bun, but not in NodeJS
  // TODO: check why this is happening
  let isShuttingDown = false
  async function gracefulShutdown(signal: string) {
    if (isShuttingDown) {
      return
    }
    isShuttingDown = true
    logger.info(`recieved ${signal}, gracefully shutting down...`)
    for (const destroyFn of destroyFns) {
      await destroyFn()
    }
    process.exit(0)
  }
  process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM')
  })
  process.on('SIGINT', () => {
    gracefulShutdown('SIGINT')
  })
}

start().catch((error) => {
  logger.error(error, 'error starting server')
  process.exit(1)
})
