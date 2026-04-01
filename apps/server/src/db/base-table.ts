import { timestamp, uuid } from 'drizzle-orm/pg-core'

export const baseTable = {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}
