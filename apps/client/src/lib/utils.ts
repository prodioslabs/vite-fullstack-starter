import { AxiosError } from 'axios'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ErrorWithMessage = {
  error?: string
  message?: string
}

export function getErrorMessage(error: unknown, defaultMessage: string = 'Something went wrong. Please try again.') {
  let message = defaultMessage

  if (error && typeof error === 'object') {
    const errorObj = error as ErrorWithMessage

    if (errorObj.error) {
      message = errorObj.error
    } else if (error instanceof AxiosError) {
      message = error.response?.data?.message || error.message
    } else if (error instanceof Error) {
      message = error.message
    }
  }

  return message
}
