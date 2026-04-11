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
    HEALTHCHECK_API_KEY: z.string().min(32),
    S3_ENDPOINT: z.string().optional().default('localhost'),
    S3_PORT: z.coerce.number().optional().default(9000),
    S3_USE_SSL: z.coerce.boolean().optional().default(false),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_REGION: z.string().optional(),
    S3_BUCKET: z.string().optional().default('upload'),
  })
  .parse(process.env)
