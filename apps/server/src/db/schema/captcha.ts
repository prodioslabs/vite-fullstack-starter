import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

export const captchaStatus = pgEnum('captcha_status', [
  'VERIFIED',
  'PENDING',
  'FAILED',
])

export const captcha = pgTable(
  'captcha',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    captcha: text('captcha').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    status: captchaStatus().notNull().default('PENDING'),
  },
  (t) => [
    unique('captcha_status_unique').on(t.captcha, t.status),
    index('expires_at_idx').on(t.expiresAt),
  ],
)
