import { relations } from 'drizzle-orm'
import { pgTable, text, integer } from 'drizzle-orm/pg-core'

import { baseTable } from '../base-table'

import { user } from './auth'

export const file = pgTable('file', {
  ...baseTable,
  bucket: text('bucket').notNull(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  createdById: text('created_by_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const fileRelations = relations(file, ({ one }) => ({
  createdBy: one(user, {
    fields: [file.createdById],
    references: [user.id],
  }),
}))

export type File = typeof file.$inferSelect
export type NewFile = typeof file.$inferInsert
