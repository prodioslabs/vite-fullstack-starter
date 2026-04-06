import 'dotenv/config'
import * as z from 'zod'

export const env = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .optional()
      .default('development'),
    ENABLE_CRON: z
      .string()
      .transform((val) => val === 'true')
      .optional()
      .default(true),
    ENABLE_QUEUE_WORKERS: z
      .string()
      .transform((val) => val === 'true')
      .optional()
      .default(true),
    ENABLE_HTTP_SERVER: z
      .string()
      .transform((val) => val === 'true')
      .optional()
      .default(true),
    PORT: z.coerce.number().optional().default(3000),
    LOKI_HOST: z.url().optional(),
    LOKI_USERNAME: z.string().optional(),
    LOKI_PASSWORD: z.string().optional(),
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.coerce.number().optional(),
    REDIS_DB: z.coerce.number().optional(),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_USERNAME: z.string().optional(),
    DATABASE_URL: z.string().startsWith('postgresql://'),
    CORS_ORIGIN: z.url().optional().default('http://localhost:5173'),
    BETTER_AUTH_URL: z.url().optional().default('http://localhost:3000'),
  })
  .parse(process.env)
