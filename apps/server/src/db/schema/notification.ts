import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'

import { user } from './auth'

export const notificationTypeEnum = pgEnum('notification_type', ['TEST'])

export const notification = pgTable('notification', {
  ...baseTable,
  type: notificationTypeEnum('type').notNull(),
  metadata: jsonb('metadata').notNull(),
  receiverId: text('receiver_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at', { withTimezone: true }),
})

export const notificationRelations = relations(notification, ({ one }) => ({
  receiver: one(user, {
    fields: [notification.receiverId],
    references: [user.id],
  }),
}))

export type Notification = typeof notification.$inferSelect
export type NewNotification = typeof notification.$inferInsert
