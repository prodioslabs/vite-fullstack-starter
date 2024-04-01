import { initQueryClient } from '@ts-rest/react-query'
import { contract } from '@repo/contract'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

export const client = initQueryClient(contract, {
  baseUrl: 'http://localhost:3000',
  baseHeaders: {},
})
