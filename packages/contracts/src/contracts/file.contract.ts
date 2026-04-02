import { z } from 'zod'

export const uploadedFileSchema = z.object({
  id: z.string(),
  mimeType: z.string(),
  bucket: z.string(),
  filename: z.string(),
})
export type UploadedFile = z.infer<typeof uploadedFileSchema>

export const cropInputSchema = z.object({
  unit: z.enum(['%', 'px']),
  width: z.number(),
  height: z.number(),
  x: z.number(),
  y: z.number(),
})
export type CropInput = z.infer<typeof cropInputSchema>
