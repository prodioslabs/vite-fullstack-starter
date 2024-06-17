import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_API_BASE_URL: z.string().transform((value) => {
      // Allow relative or absolute URLs but convert them to absolute URLs and remove trailing slashes
      return new URL(value, location.href).href.replace(/\/$/, '')
    }),
  },
  runtimeEnv: {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  },
})
