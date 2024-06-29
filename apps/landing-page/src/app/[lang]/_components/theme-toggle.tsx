'use client'

import * as React from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { cn, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui'

type ThemeToggleProps = {
  className?: string
  style?: React.CSSProperties
}

export default function ThemeToggle({ className, style }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn('relative inline-block h-9 w-9 overflow-hidden rounded-md border', className)}
          style={style}
        >
          <AnimatePresence>
            {resolvedTheme === 'dark' ? (
              <motion.div
                key="dark"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ y: 20, opacity: 0.02, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0.02, rotate: 90 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <MoonIcon className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="light"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ y: 20, opacity: 0.02, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 20, opacity: 0.02, rotate: 90 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <SunIcon className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="z-popover">
        <DropdownMenuItem
          onClick={() => {
            setTheme('light')
          }}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme('dark')
          }}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme('system')
          }}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
