import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import { auth, type User } from '../lib/auth'
import type { AppContext } from '../lib/context'

export const authMiddleware = createMiddleware<{ Variables: AppContext }>(
  async function authenicateUser(c, next) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) {
      throw new HTTPException(403, { message: 'Unauthorized' })
    }
    c.set('session', session.session)
    c.set('user', session.user)
    return next()
  },
)

export function authorizedForMiddleware(roles: User['role'][]) {
  return createMiddleware<{ Variables: AppContext }>(
    async function verifyUserRole(c, next) {
      const user = c.get('user')
      if (!user || !roles.includes(user.role)) {
        throw new HTTPException(403, { message: 'Unauthorized' })
      }
      return next()
    },
  )
}
