import type { App } from '@repo/server/app'
import { hc, type ClientResponse } from 'hono/client'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import * as z from 'zod'

import { env } from './env'

export const honoClient = hc<App>(env.VITE_API_BASE_URL, {
  init: { credentials: 'include' },
})

export async function getDataOrThrow<T>(
  api: Promise<ClientResponse<T, ContentfulStatusCode, 'json'>>,
): Promise<T> {
  const res = await api
  if (res.ok) {
    const data = await res.json()
    return data
  }
  let errorMessage
  try {
    const errorData = z.object({ error: z.string() }).parse(await res.json())
    errorMessage = errorData.error
  } catch {
    errorMessage = 'Something went wrong. Please try again'
  }
  throw new Error(errorMessage)
}
