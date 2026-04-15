import { relations } from 'drizzle-orm'
import {
  index,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth'

export const notification = pgTable(
  'notification',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    type: text('type').notNull(),
    metadata: json('metadata').notNull(),
    readAt: timestamp('read_at', { withTimezone: true }),
    receiverId: text('receiver_id')
      .references(() => user.id)
      .notNull(),
  },
  (t) => [index('reciever_id_created_at_idx').on(t.receiverId, t.createdAt)],
)

export const notificationRelations = relations(notification, ({ one }) => ({
  receiver: one(user, {
    fields: [notification.receiverId],
    references: [user.id],
  }),
}))
