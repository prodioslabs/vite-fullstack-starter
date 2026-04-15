import { DrizzleError } from 'drizzle-orm'
import * as z from 'zod'

export function getErrorMessage(
  error: unknown,
  defaultMessage = 'Something went wrong. Please try again',
) {
  let errorMessage = defaultMessage
  if (error instanceof z.ZodError) {
    errorMessage = error.issues.length
      ? error.issues.map((e) => e.message).join(', ')
      : error.message
  } else if (error instanceof DrizzleError) {
    errorMessage = error.message
  } else if (error instanceof Error) {
    errorMessage = error.message
  }
  return errorMessage
}
