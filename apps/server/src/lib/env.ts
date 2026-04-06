import 'dotenv/config'
import * as z from 'zod'

export const env = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .optional()
      .default('development'),
    // Cron
    ENABLE_CRON: z
      .string()
      .transform((val) => val === 'true')
      .optional()
      .default(true),
    // BullMQ
    ENABLE_QUEUE_WORKERS: z
      .string()
      .transform((val) => val === 'true')
      .optional()
      .default(true),
    // HTTP Server
    ENABLE_HTTP_SERVER: z
      .string()
      .transform((val) => val === 'true')
      .optional()
      .default(true),
    PORT: z.coerce.number().optional().default(3000),
    // Loki
    LOKI_HOST: z.url().optional(),
    LOKI_USERNAME: z.string().optional(),
    LOKI_PASSWORD: z.string().optional(),
    // Redis
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.coerce.number().optional(),
    REDIS_DB: z.coerce.number().optional(),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_USERNAME: z.string().optional(),
  })
  .parse(process.env)
