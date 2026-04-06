import type { Cron } from 'croner'

import { logger } from './lib/logger'

export function bootstrapCronJobs() {
  const cronJobs: Cron[] = []

  return function destory() {
    logger.info('stopping all cron jobs')
    cronJobs.forEach((cronJob) => cronJob.stop())
    logger.info('stopped all cron jobs')
  }
}
