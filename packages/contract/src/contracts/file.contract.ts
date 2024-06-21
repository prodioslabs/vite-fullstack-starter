import { z } from 'zod'
import { client } from './client'
import { error } from '../lib/utils'

export const fileContract = client.router(
  {
    uploadFile: {
      method: 'POST',
      path: '/',
      contentType: 'multipart/form-data',
      body: client.type<{ file: File }>(),
      responses: {
        201: z.object({
          id: z.string(),
          mimeType: z.string(),
          bucket: z.string(),
          filename: z.string(),
        }),
        403: error,
        500: error,
      },
    },
  },
  {
    pathPrefix: '/file',
  },
)
