import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_API_URL: z.string().url().min(1),
  },
  runtimeEnv: {
    VITE_API_URL: process.env.VITE_API_URL,
  },
})
