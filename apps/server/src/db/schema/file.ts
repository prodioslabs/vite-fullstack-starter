import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth'

export const file = pgTable(
  'file',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    filename: text('filename').notNull(),
    bucket: text('bucket').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    createdById: text('created_by_id')
      .references(() => user.id)
      .notNull(),
  },
  (t) => [index('created_by_id_idx').on(t.createdById)],
)

export const fileRelations = relations(file, ({ one }) => ({
  createdBy: one(user, { fields: [file.createdById], references: [user.id] }),
}))
