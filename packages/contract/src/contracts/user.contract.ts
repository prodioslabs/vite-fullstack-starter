import { z } from 'zod'
import { client } from './client'

export const user = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['USER', 'SUPER_ADMIN']),
})

export const userContract = client.router(
  {
    getCurrentUser: {
      method: 'GET',
      path: '/me',
      responses: {
        200: z.object({
          user,
        }),
      },
    },
  },
  {
    pathPrefix: '/user',
  },
)
