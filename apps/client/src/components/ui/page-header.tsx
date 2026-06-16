import { cloneElement } from 'react'

import { cn } from '@/lib/utils'

type PageHeaderProps = Omit<
  React.ComponentProps<'div'>,
  'children' | 'title'
> & {
  icon?: React.ReactElement<{ className?: string }>
  title: React.ReactNode
  description?: React.ReactNode
  extraContent?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  icon,
  extraContent,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...rest}>
      {icon ? (
        <div className="dark:bg-primary bg-muted border text-muted-foreground rounded-md  p-2">
          {cloneElement(icon, {
            className: cn(icon.props.className, 'size-6'),
          })}
        </div>
      ) : null}
      <div className="flex-1">
        <div className="font-display text-lg font-medium">{title}</div>
        {description ? (
          <div className="text-muted-foreground text-sm">{description}</div>
        ) : null}
      </div>
      {extraContent}
    </div>
  )
}
