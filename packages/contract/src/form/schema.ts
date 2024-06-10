import { z } from 'zod'

export type BaseValidationSchema = z.ZodEffects<z.ZodObject<z.ZodRawShape>> | z.ZodObject<z.ZodRawShape>

export type Option = z.infer<typeof option>

const localizationData = z.record(z.string(), z.string()).and(
  z.object({
    en: z.string(),
  }),
)

export const option = z.object({
  value: z.string(),
  label: localizationData,
  description: localizationData.optional(),
})

export const file = z.record(z.string(), z.string()).and(
  z.object({
    mimeType: z.string().optional(),
  }),
)
