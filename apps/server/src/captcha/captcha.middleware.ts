import { and, eq, gte } from 'drizzle-orm'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import { captcha } from '../db/schema'
import type { AppContext } from '../lib/context'
import { db } from '../lib/db'
import { logger } from '../lib/logger'

export const verifyCaptchaMiddleware = createMiddleware<{
  Variables: AppContext
}>(async function verifyCaptcha(c, next) {
  const requestId = c.get('requestId')
  const component = 'verifyCaptchaMiddleware'

  const problem = c.req.header('X-Captcha-Problem')
  if (!problem) {
    logger.error({ requestId, component }, 'captcha problem header missing')
    throw new HTTPException(403, {
      message: 'Missing captcha problem header',
    })
  }

  const solution = c.req.header('X-Captcha-Solution')
  if (!solution) {
    logger.error({ requestId, component }, 'captcha solution header missing')
    throw new HTTPException(403, {
      message: 'Missing captcha solution header',
    })
  }

  const validCaptcha = await db
    .select()
    .from(captcha)
    .where(
      and(
        eq(captcha.id, problem),
        eq(captcha.status, 'PENDING'),
        gte(captcha.expiresAt, new Date()),
      ),
    )
    .then((val) => val[0])
  if (!validCaptcha) {
    logger.error({ requestId, component, problem }, 'PENDING captcha not found')
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  if (validCaptcha.captcha !== solution) {
    logger.error(
      { requestId, component, problem, solution },
      'invalid solution for captcha',
    )
    await db.delete(captcha).where(eq(captcha.id, validCaptcha.id))
    throw new HTTPException(401, { message: 'Unauthorized. Invalid captcha.' })
  }

  await db.delete(captcha).where(eq(captcha.id, validCaptcha.id))
  return next()
})
