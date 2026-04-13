import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import { auth } from '../lib/auth'
import type { AppContext } from '../lib/context'

export const authMiddleware = createMiddleware<{ Variables: AppContext }>(
  async function authenicateUser(c, next) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      throw new HTTPException(403, {
        message: 'Unauthorized',
      })
    }
    c.set('session', session.session)
    c.set('user', session.user)
    return next()
  },
)
