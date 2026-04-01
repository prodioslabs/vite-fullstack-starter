import { DEFAULT_JOB_TIMEOUT_MS } from 'src/utils/constants'
import * as z from 'zod'

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
})

export type Environment = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
