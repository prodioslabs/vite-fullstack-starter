import { oc } from '@orpc/contract'
import { z } from 'zod'

export const fileContract = {
  uploadFile: oc
    .output(
      z.object({
        id: z.string(),
        mimeType: z.string(),
        bucket: z.string(),
        filename: z.string(),
      }),
    )
    .route({ method: 'POST', path: '/file/upload' }),

  uploadImage: oc
    .input(
      z.object({
        crop: z.object({
          unit: z.enum(['%', 'px']),
          width: z.number(),
          height: z.number(),
          x: z.number(),
          y: z.number(),
        }),
      }),
    )
    .output(
      z.object({
        id: z.string(),
        mimeType: z.string(),
        bucket: z.string(),
        filename: z.string(),
      }),
    )
    .route({ method: 'POST', path: '/file/upload-image' }),
}
