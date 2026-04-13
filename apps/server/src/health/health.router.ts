import { sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import { db } from '../lib/db'
import { env } from '../lib/env'
import { logger } from '../lib/logger'

const healthCheckMiddleware = createMiddleware(async (c, next) => {
  const healthcheckApiKey = c.req.query('healthcheckApiKey')
  if (healthcheckApiKey !== env.HEALTHCHECK_API_KEY) {
    throw new HTTPException(401, { message: 'unauthorized' })
  }
  return next()
})

export const healthRouter = new Hono().get(
  '/',
  healthCheckMiddleware,
  async function getHealthStatus(c) {
    const healthChecks = await Promise.all([checkDBHealth()])
    if (healthChecks.every((val) => val === true)) {
      return c.json({ status: 'healthy' }, 200)
    }
    return c.json({ status: 'unhealthy' }, 500)
  },
)

async function checkDBHealth() {
  try {
    // This is a very dumb healthcheck
    // this doesn't take into consideration, that the migrations are applied or
    // TODO: update the check to use a real query
    const result = await db.execute(sql`select 1;`)
    if (result.length !== 1) {
      throw new Error('invalid response from database')
    }
    return true
  } catch (error) {
    logger.error(error, 'failed to connect to database')
    return false
  }
}
