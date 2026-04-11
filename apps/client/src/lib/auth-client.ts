import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { env } from './env'

export const authClient = createAuthClient({
  baseURL: `${env.VITE_API_BASE_URL}/api/auth`,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: ['USER', 'OFFICER', 'ADMIN', 'SUPER_ADMIN'] as const,
          required: false,
        },
      },
    }),
  ],
})

export type AuthClient = typeof authClient
