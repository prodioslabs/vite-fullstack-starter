import { and, eq, gte } from 'drizzle-orm'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import { captcha } from '../db/schema'
import type { AppContext } from '../lib/context'
import { db } from '../lib/db'

export const verifyCaptchaMiddleware = createMiddleware<{
  Variables: AppContext
}>(async function verifyCaptcha(c, next) {
  const problem = c.req.header('X-Captcha-Problem')
  if (!problem) {
    throw new HTTPException(403, {
      message: 'Missing captcha problem header',
    })
  }

  const solution = c.req.header('X-Captcha-Solution')
  if (!solution) {
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
    throw new HTTPException(403, { message: 'Unauthorized' })
  }

  if (validCaptcha.captcha !== solution) {
    await db.update(captcha).set({ status: 'FAILED' })
    throw new HTTPException(403, { message: 'Unauthorized' })
  }

  await db.update(captcha).set({ status: 'VERIFIED' })
  return next()
})
