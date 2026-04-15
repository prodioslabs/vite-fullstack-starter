import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as z from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const responseErrorSchema = z
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

export function getErrorMessage(
  error: unknown,
  defaultMessage = 'Something went wrong. Please try again',
) {
  let errorMessage: string | undefined

  if (error instanceof z.ZodError) {
    errorMessage = error.message
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    const responseErrorValidation = responseErrorSchema.safeParse(error)
    if (responseErrorValidation.success) {
      errorMessage = responseErrorValidation.data
    }
  }

  return errorMessage ?? defaultMessage
}

export type WithBasicProps<T = unknown> = T & {
  className?: string
  style?: React.CSSProperties
}

export function invariant(cond: unknown, message: string): asserts cond {
  if (!cond) {
    throw new Error(message)
  }
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
