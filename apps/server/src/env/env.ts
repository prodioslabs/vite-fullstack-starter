import * as z from 'zod'

import { DEFAULT_JOB_TIMEOUT_MS } from '../utils/constants'

export const envSchema = z.object({
  DATABASE_URL: z.string().startsWith('postgresql://'),
  APP_BASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  PORT: z.string().default('3000'),
  SMTP_USER_NAME: z.email(),
  SMTP_PASSWORD: z.string().min(8),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().default('6379'),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  JOB_TIMEOUT_MS: z.string().default(DEFAULT_JOB_TIMEOUT_MS.toString()),
  S3_BUCKET: z.string(),
  S3_ENDPOINT: z.string().optional(),
  S3_PORT: z.string().default('9000'),
  S3_USE_SSL: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_REGION: z.string().optional(),
  LOKI_HOST: z.string().url().optional(),
  LOKI_USERNAME: z.string().optional(),
  LOKI_PASSWORD: z.string().optional(),
  LOKI_TOKEN: z.string().optional(),
})

export type Environment = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
