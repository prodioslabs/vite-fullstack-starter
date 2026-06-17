import { zValidator } from '@hono/zod-validator'
import { desc, eq, inArray, or } from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as z from 'zod'

import { authMiddleware } from '../auth/auth.middleware'
import { event, eventHistory, eventParticipant } from '../db/schema'
import { db } from '../lib/db'
import { logger } from '../lib/logger'

import { eventAccessMiddleware, eventOwnerMiddleware } from './event.middleware'

const eventTimeSchema = z
  .object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date().optional(),
    isEventAllDay: z.boolean().optional().default(false),
  })
  .refine((data) => data.isEventAllDay || data.endTime !== undefined, {
    message: 'endTime is required when event is not all-day',
    path: ['endTime'],
  })
  .refine((data) => !data.endTime || data.endTime > data.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  })

const eventIdParamValidator = zValidator('param', z.object({ id: z.uuid() }))

export const eventRouter = new Hono()
  .post(
    '/',
    authMiddleware,
    zValidator(
      'json',
      eventTimeSchema.extend({
        name: z.string().min(1),
        description: z.string().optional(),
        conferenceLink: z.string().url().optional(),
        participantIds: z.array(z.string().min(1)).optional(),
      }),
    ),
    async function createEvent(c) {
      const component = 'createEvent'
      const requestId = c.get('requestId')
      const user = c.get('user')
      const body = c.req.valid('json')

      logger.info({ component, requestId, userId: user.id }, 'creating event')

      const createdEvent = await db.transaction(async (tx) => {
        const [record] = await tx
          .insert(event)
          .values({
            name: body.name,
            description: body.description,
            startTime: body.startTime,
            endTime: body.isEventAllDay ? null : body.endTime,
            isEventAllDay: body.isEventAllDay,
            conferenceLink: body.conferenceLink,
            createdById: user.id,
          })
          .returning()

        if (!record) {
          throw new HTTPException(500, { message: 'Failed to create event' })
        }

        if (body.participantIds?.length) {
          await tx.insert(eventParticipant).values(
            body.participantIds.map((userId) => ({
              eventId: record.id,
              userId,
            })),
          )
        }

        await tx.insert(eventHistory).values({
          eventId: record.id,
          action: 'created',
          performedById: user.id,
        })

        return record
      })

      return c.json({ event: createdEvent }, 201)
    },
  )
  .get(
    '/',
    authMiddleware,
    zValidator(
      'query',
      z.object({
        limit: z.coerce.number().optional().default(20),
        offset: z.coerce.number().optional().default(0),
      }),
    ),
    async function listEvents(c) {
      const component = 'listEvents'
      const requestId = c.get('requestId')
      const user = c.get('user')
      const { limit, offset } = c.req.valid('query')

      logger.info(
        { component, requestId, userId: user.id, limit, offset },
        'listing events',
      )

      const participantEventIds = db
        .select({ eventId: eventParticipant.eventId })
        .from(eventParticipant)
        .where(eq(eventParticipant.userId, user.id))

      const events = await db
        .select()
        .from(event)
        .where(
          or(
            eq(event.createdById, user.id),
            inArray(event.id, participantEventIds),
          ),
        )
        .orderBy(desc(event.startTime))
        .limit(limit)
        .offset(offset)

      return c.json({ events })
    },
  )
  .get(
    '/:id',
    authMiddleware,
    eventIdParamValidator,
    eventAccessMiddleware,
    async function getEvent(c) {
      const component = 'getEvent'
      const requestId = c.get('requestId')
      const user = c.get('user')
      const record = c.get('event')!

      logger.info(
        { component, requestId, userId: user.id, eventId: record.id },
        'getting event',
      )

      const participants = await db
        .select()
        .from(eventParticipant)
        .where(eq(eventParticipant.eventId, record.id))

      return c.json({ event: record, participants })
    },
  )
  .post(
    '/:id/cancel',
    authMiddleware,
    eventIdParamValidator,
    eventOwnerMiddleware,
    async function cancelEvent(c) {
      const component = 'cancelEvent'
      const requestId = c.get('requestId')
      const user = c.get('user')
      const record = c.get('event')!

      logger.info(
        { component, requestId, userId: user.id, eventId: record.id },
        'cancelling event',
      )

      if (record.eventStatus === 'cancelled') {
        throw new HTTPException(400, { message: 'Event is already cancelled' })
      }

      const cancelledEvent = await db.transaction(async (tx) => {
        const [updated] = await tx
          .update(event)
          .set({ eventStatus: 'cancelled' })
          .where(eq(event.id, record.id))
          .returning()

        if (!updated) {
          throw new HTTPException(500, { message: 'Failed to cancel event' })
        }

        await tx.insert(eventHistory).values({
          eventId: record.id,
          action: 'cancelled',
          performedById: user.id,
        })

        return updated
      })

      return c.json({ event: cancelledEvent })
    },
  )
  .post(
    '/:id/reschedule',
    authMiddleware,
    eventIdParamValidator,
    eventOwnerMiddleware,
    zValidator('json', eventTimeSchema),
    async function rescheduleEvent(c) {
      const component = 'rescheduleEvent'
      const requestId = c.get('requestId')
      const user = c.get('user')
      const record = c.get('event')!
      const body = c.req.valid('json')

      logger.info(
        { component, requestId, userId: user.id, eventId: record.id },
        'rescheduling event',
      )

      if (record.eventStatus === 'cancelled') {
        throw new HTTPException(400, {
          message: 'Cannot reschedule a cancelled event',
        })
      }

      const rescheduledEvent = await db.transaction(async (tx) => {
        const [updated] = await tx
          .update(event)
          .set({
            startTime: body.startTime,
            endTime: body.isEventAllDay ? null : body.endTime,
            isEventAllDay: body.isEventAllDay,
          })
          .where(eq(event.id, record.id))
          .returning()

        if (!updated) {
          throw new HTTPException(500, {
            message: 'Failed to reschedule event',
          })
        }

        await tx.insert(eventHistory).values({
          eventId: record.id,
          action: 'rescheduled',
          performedById: user.id,
          metadata: {
            previousStartTime: record.startTime.toISOString(),
            previousEndTime: record.endTime?.toISOString() ?? null,
            previousIsEventAllDay: record.isEventAllDay,
          },
        })

        return updated
      })

      return c.json({ event: rescheduledEvent })
    },
  )
