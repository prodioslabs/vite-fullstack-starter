import { z } from 'zod'
import { client } from './client'
import { user } from './user.contract'

export const authContract = client.router(
  {
    login: {
      method: 'POST',
      path: '/login',
      body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }),
      responses: {
        200: z.object({
          token: z.string(),
          user,
        }),
        401: z.object({
          error: z.string(),
        }),
      },
    },
    signup: {
      method: 'POST',
      path: '/signup',
      body: z.object({
        email: z.string().email(),
        name: z.string(),
        role: z.enum(['USER', 'SUPER_ADMIN']).optional().default('USER'),
        password: z.string().min(8),
      }),
      responses: {
        201: z.object({
          token: z.string(),
          user,
        }),
        409: z.object({
          error: z.string(),
        }),
        500: z.object({
          error: z.string(),
        }),
      },
    },
  },
  { pathPrefix: '/auth' },
)
