import { and, eq } from 'drizzle-orm'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import { event, eventParticipant } from '../db/schema'
import type { AppContext } from '../lib/context'
import { db } from '../lib/db'

export const eventAccessMiddleware = createMiddleware<{ Variables: AppContext }>(
  async function eventAccessMiddleware(c, next) {
    const user = c.get('user')
    const id = c.req.param('id')
    if (!id) {
      throw new HTTPException(400, { message: 'Event id is required' })
    }

    const [record] = await db
      .select()
      .from(event)
      .where(eq(event.id, id))
      .limit(1)

    if (!record) {
      throw new HTTPException(404, { message: 'Event not found' })
    }

    if (record.createdById !== user.id) {
      const [participant] = await db
        .select({ id: eventParticipant.id })
        .from(eventParticipant)
        .where(
          and(
            eq(eventParticipant.eventId, id),
            eq(eventParticipant.userId, user.id),
          ),
        )
        .limit(1)

      if (!participant) {
        throw new HTTPException(404, { message: 'Event not found' })
      }
    }

    c.set('event', record)
    return next()
  },
)

export const eventOwnerMiddleware = createMiddleware<{ Variables: AppContext }>(
  async function eventOwnerMiddleware(c, next) {
    const user = c.get('user')
    const id = c.req.param('id')
    if (!id) {
      throw new HTTPException(400, { message: 'Event id is required' })
    }

    const [record] = await db
      .select()
      .from(event)
      .where(eq(event.id, id))
      .limit(1)

    if (!record) {
      throw new HTTPException(404, { message: 'Event not found' })
    }

    if (record.createdById !== user.id) {
      throw new HTTPException(403, { message: 'Forbidden' })
    }

    c.set('event', record)
    return next()
  },
)
