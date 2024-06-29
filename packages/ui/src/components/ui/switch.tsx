'use client'

import { forwardRef } from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { VariantProps, cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const rootVariant = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-muted-foreground/10 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
  {
    variants: {
      size: {
        sm: 'h-4 w-7',
        default: 'h-5 w-9',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const thumbVariant = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
  {
    variants: {
      size: {
        sm: 'h-3 w-3 data-[state=checked]:translate-x-3',
        default: 'h-4 w-4 data-[state=checked]:translate-x-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & VariantProps<typeof thumbVariant>
>(({ size, className, ...props }, ref) => (
  <SwitchPrimitives.Root className={cn(rootVariant({ size }), className)} {...props} ref={ref}>
    <SwitchPrimitives.Thumb className={cn(thumbVariant({ size }))} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
