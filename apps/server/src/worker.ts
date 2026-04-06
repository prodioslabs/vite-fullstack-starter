import { type Worker } from 'bullmq'

import { logger } from './lib/logger'

export function bootstrapWorkers() {
  const workers: Worker[] = []

  return async function destroy() {
    logger.info('closing all workers')
    return Promise.all(workers.map((worker) => worker.close())).then(() => {
      logger.info('closed all workers')
    })
  }
}
