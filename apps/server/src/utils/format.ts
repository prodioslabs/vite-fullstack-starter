import { ZodError } from 'zod'

export function formatErrorMessage(
  error: unknown,
  defaultErrorMessage: string = 'Something went wrong. Please try again later.',
) {
  const errorMessage: unknown = defaultErrorMessage

  if (error instanceof ZodError) {
    return error.cause
  }
  if (error instanceof Error) {
    return `message: ${error.message}, stack: ${error.stack}`
  }
  return errorMessage
}
