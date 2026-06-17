import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth'

export const eventStatus = pgEnum('event_status', ['active', 'cancelled'])

export const eventHistoryAction = pgEnum('event_history_action', [
  'created',
  'updated',
  'cancelled',
  'rescheduled',
])

export const event = pgTable(
  'event',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }),
    isEventAllDay: boolean('is_event_all_day').default(false).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    createdById: text('created_by_id')
      .references(() => user.id)
      .notNull(),
    conferenceLink: text('conference_link'),
    eventStatus: eventStatus('event_status').notNull().default('active'),
  },
  (t) => [
    index('event_created_by_id_idx').on(t.createdById),
    index('event_start_time_idx').on(t.startTime),
    check(
      'event_all_day_or_end_time_chk',
      sql`${t.isEventAllDay} = true OR ${t.endTime} IS NOT NULL`,
    ),
  ],
)

export const eventParticipant = pgTable(
  'event_participant',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    eventId: uuid('event_id')
      .references(() => event.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => [
    uniqueIndex('event_participant_event_id_user_id_idx').on(
      t.eventId,
      t.userId,
    ),
    index('event_participant_user_id_idx').on(t.userId),
  ],
)

export const eventHistory = pgTable(
  'event_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    eventId: uuid('event_id')
      .references(() => event.id, { onDelete: 'cascade' })
      .notNull(),
    action: eventHistoryAction('action').notNull(),
    performedById: text('performed_by_id')
      .references(() => user.id)
      .notNull(),
    metadata: json('metadata'),
  },
  (t) => [
    index('event_history_event_id_created_at_idx').on(t.eventId, t.createdAt),
    index('event_history_performed_by_id_idx').on(t.performedById),
  ],
)

export const eventRelations = relations(event, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [event.createdById],
    references: [user.id],
  }),
  participants: many(eventParticipant),
  history: many(eventHistory),
}))

export const eventParticipantRelations = relations(
  eventParticipant,
  ({ one }) => ({
    event: one(event, {
      fields: [eventParticipant.eventId],
      references: [event.id],
    }),
    user: one(user, {
      fields: [eventParticipant.userId],
      references: [user.id],
    }),
  }),
)

export const eventHistoryRelations = relations(eventHistory, ({ one }) => ({
  event: one(event, {
    fields: [eventHistory.eventId],
    references: [event.id],
  }),
  performedBy: one(user, {
    fields: [eventHistory.performedById],
    references: [user.id],
  }),
}))
