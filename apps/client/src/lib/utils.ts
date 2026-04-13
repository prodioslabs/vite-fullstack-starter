import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as z from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(
  error: unknown,
  defaultMessage = 'Something went wrong. Please try again',
) {
  let errorMessage = defaultMessage
  if (error instanceof z.ZodError) {
    errorMessage = error.message
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    const responseErrorValidation = z
      .object({
        body: z
          .object({
            error: z.string().optional(),
            message: z.string().optional(),
          })
          .optional(),
        error: z.string().optional(),
        message: z.string().optional(),
      })
      .transform((val) =>
        val.body
          ? (val.body.error ?? val.body.message)
          : (val.error ?? val.message),
      )
      .safeParse(error)
    if (responseErrorValidation.success) {
      errorMessage = responseErrorValidation.data ?? defaultMessage
    }
  }
  return errorMessage
}

export type WithBasicProps<T = unknown> = T & {
  className?: string
  style?: React.CSSProperties
}
