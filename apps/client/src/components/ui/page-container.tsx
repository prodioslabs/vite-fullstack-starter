import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type PageContainerProps = ComponentProps<'div'>

export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-6 max-sm:gap-3 max-sm:p-4',
        className,
      )}
      {...props}
    />
  )
}
