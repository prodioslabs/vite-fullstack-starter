import { oc } from '@orpc/contract'
import * as z from 'zod'

const helloWorldContract = oc
  .input(
    z
      .object({
        message: z.string().optional(),
      })
      .optional(),
  )
  .output(
    z.object({
      reply: z.string(),
    }),
  )
  .route({
    method: 'GET',
    path: '/',
  })

export const contract = {
  helloWorld: helloWorldContract,
}

export * from './auth.contract'
