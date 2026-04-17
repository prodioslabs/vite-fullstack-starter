import { redirect } from '@tanstack/react-router'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { env } from './env'

export const authClient = createAuthClient({
  baseURL: `${env.VITE_API_BASE_URL}/api/auth`,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: ['USER', 'OFFICER', 'SUPER_ADMIN'] as const,
          required: false,
        },
      },
    }),
  ],
})

export type AuthClient = typeof authClient
export type User = AuthClient['$Infer']['Session']['user']
export type UserRole = NonNullable<User['role']>

export const USER_ROLES: UserRole[] = ['USER', 'OFFICER', 'SUPER_ADMIN']

export function requireRole(user: User, roles: UserRole[]) {
  if (!user.role || !roles.includes(user.role)) {
    throw redirect({ to: '/', replace: true })
  }
}
