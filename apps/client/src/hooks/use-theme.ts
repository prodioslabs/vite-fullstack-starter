import { useContext } from 'react'

import { ThemeProviderContext } from '../components/ui/theme-provider'

import { invariant } from '@/lib/utils'

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  invariant(context, 'useTheme must be used within a ThemeProvider')
  return context
}
