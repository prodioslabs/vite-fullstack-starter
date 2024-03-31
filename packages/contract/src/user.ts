import { z } from 'zod'
import { client } from './client'

export const user = z.object({
  name: z.string(),
})

export const userContract = client.router({
  getCurerentUser: {
    method: 'GET',
    path: '/user/me',
    responses: {
      200: user,
    },
  },
})
