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
      .object({ body: z.object({ error: z.string() }) })
      .safeParse(error)
    if (responseErrorValidation.success) {
      errorMessage = responseErrorValidation.data.body.error
    }
  }
  return errorMessage
}
