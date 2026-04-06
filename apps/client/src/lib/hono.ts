import type { App } from '@repo/server'
import { hc } from 'hono/client'

import { env } from './env'

export const honoClient = hc<App>(env.VITE_API_BASE_URL, {
  init: { credentials: 'include' },
})
