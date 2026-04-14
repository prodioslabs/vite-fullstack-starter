import { Cron } from 'croner'
import { lte } from 'drizzle-orm'

import { captcha } from '../db/schema'
import { db } from '../lib/db'
import { logger } from '../lib/logger'

export function deleteExpiredCaptchasCron() {
  return new Cron('0 * * * *', async function deleteExpiredCaptchas() {
    const component = 'deleteExpiredCaptchasCron'
    logger.info({ component }, 'deleting expired captchas')
    const deletedCaptchas = await db
      .delete(captcha)
      .where(lte(captcha.expiresAt, new Date()))
      .returning({ id: captcha.id })
    logger.info(
      { component, count: deletedCaptchas.length },
      'expired captchas deleted',
    )
  })
}
