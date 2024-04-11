import { initQueryClient } from '@ts-rest/react-query'
import { contract } from '@repo/contract'
import { QueryClient } from '@tanstack/react-query'
import axios, { isAxiosError } from 'axios'
import { env } from './env'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

const BASE_URL = env.VITE_API_BASE_URL
export const client = initQueryClient(contract, {
  baseUrl: BASE_URL,
  baseHeaders: {},
  api: async ({ path, body, method, headers }) => {
    try {
      const result = await axios.request({
        method,
        url: path,
        headers,
        data: body,
        withCredentials: true,
      })
      return { status: result.status, body: result.data, headers: result.headers as unknown as any }
    } catch (error) {
      if (isAxiosError(error)) {
        const response = error.response
        return { status: response?.status ?? 500, body: response?.data, headers: error.response?.headers ?? {} }
      }
      throw error
    }
  },
})
