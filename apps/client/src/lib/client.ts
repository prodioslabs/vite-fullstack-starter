import { initQueryClient } from '@ts-rest/react-query'
import { contract } from '@repo/contract'
import { QueryClient } from '@tanstack/react-query'
import axios, { isAxiosError, AxiosError, AxiosResponse } from 'axios'
import { env } from './env'
import { API_TOKEN_LOCAL_STORAGE_KEY } from './constants'

export const queryClient = new QueryClient()

// TOGO: Get this from .env
const BASE_URL = env.VITE_API_BASE_URL
export const client = initQueryClient(contract, {
  baseUrl: BASE_URL,
  baseHeaders: {},
  // TODO: Fix this type
  api: async ({ path, body, method, headers }) => {
    const token = window.localStorage.getItem(API_TOKEN_LOCAL_STORAGE_KEY)
    try {
      const result = await axios.request({
        method,
        url: path,
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`,
        },
        data: body,
      })
      return { status: result.status, body: result.data, headers: result.headers as unknown as any }
    } catch (e: Error | AxiosError | any) {
      if (isAxiosError(e)) {
        const error = e as AxiosError
        const response = error.response as AxiosResponse
        return { status: response.status, body: response.data, headers: error.response?.headers ?? {} }
      }
      throw e
    }
  },
})
