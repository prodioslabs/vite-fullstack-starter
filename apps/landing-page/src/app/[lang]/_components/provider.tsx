'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient, trpc, trpcClient } from '@/lib/trpc/client'
import { ThemeProvider } from './theme-provider'

type ProviderProps = React.PropsWithChildren<{}>

export default function Provider({ children }: ProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          {children}
        </trpc.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
