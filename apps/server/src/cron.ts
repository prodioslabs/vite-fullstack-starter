import type { Cron } from 'croner'

import { deleteExpiredCaptchasCron } from './captcha/captcha.cron'
import { logger } from './lib/logger'

export function bootstrapCronJobs() {
  const cronJobs: Cron[] = []

  cronJobs.push(deleteExpiredCaptchasCron())

  return function destory() {
    logger.info('stopping all cron jobs')
    cronJobs.forEach((cronJob) => cronJob.stop())
    logger.info('stopped all cron jobs')
  }
}
