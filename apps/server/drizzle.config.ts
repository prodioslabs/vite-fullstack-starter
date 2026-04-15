import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import * as z from 'zod'

const { DATABASE_URL } = z
  .object({ DATABASE_URL: z.string().startsWith('postgres') })
  .parse(process.env)

// eslint-disable-next-line no-console
console.log('Using DATABASE_URL:', DATABASE_URL)

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema',
  out: './src/db/migrations',
  dbCredentials: {
    url: DATABASE_URL,
  },
})
