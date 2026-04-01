import { oc } from '@orpc/contract'
import * as z from 'zod'

import { notificationContract } from './notification.contract'

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
  notifications: notificationContract,
}

export * from './auth.contract'
export * from './notification.contract'
