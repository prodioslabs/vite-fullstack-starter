import { createORPCClient } from '@orpc/client'
import { type ContractRouterClient } from '@orpc/contract'
import { OpenAPILink } from '@orpc/openapi-client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { contract } from '@repo/contracts'
import { QueryClient } from '@tanstack/react-query'

import { env } from './env'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

const link = new OpenAPILink(contract, {
  url: env.VITE_API_BASE_URL,
  fetch: (request, init) => {
    return globalThis.fetch(request, {
      ...init,
      credentials: 'include',
    })
  },
})

export const client: ContractRouterClient<typeof contract> =
  createORPCClient(link)

export const orpc = createTanstackQueryUtils(client)
