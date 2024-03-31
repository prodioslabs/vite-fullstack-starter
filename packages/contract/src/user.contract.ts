import { z } from 'zod'
import { client } from './client'

export const user = z.object({
  name: z.string(),
  email: z.string().email(),
})

export const userContract = client.router(
  {
    getCurerentUser: {
      method: 'GET',
      path: '/me',
      responses: {
        200: user,
      },
    },
  },
  {
    pathPrefix: '/user',
  },
)
