import { drizzle } from 'drizzle-orm/bun-sql'
import * as z from 'zod'

import * as schema from './schema/index'

const { DATABASE_URL } = z
  .object({
    DATABASE_URL: z.string().startsWith('postgresql://'),
  })
  .parse(process.env)

export const db = drizzle(DATABASE_URL, { schema })
