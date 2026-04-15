import { Link } from '@tanstack/react-router'
import { RefreshCwIcon, TriangleAlertIcon } from 'lucide-react'

import { Button } from './button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './empty'

import { getErrorMessage, type WithBasicProps } from '@/lib/utils'

type ErrorMessageProps = WithBasicProps<{
  title: React.ReactNode
  error?: unknown
  onReset?: React.ComponentProps<'button'>['onClick']
  resetButtonMessage?: React.ReactNode
  resetButtonIcon?: React.ComponentProps<typeof Button>['icon']
  showBackHomeLink?: boolean
}>

export function ErrorMessage({
  title,
  error,
  onReset,
  resetButtonMessage = 'Retry Again',
  resetButtonIcon = <RefreshCwIcon />,
  showBackHomeLink = true,
  className,
  style,
}: ErrorMessageProps) {
  return (
    <Empty className={className} style={style}>
      <EmptyMedia variant="icon">
        <TriangleAlertIcon />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {error ? (
          <EmptyDescription>{getErrorMessage(error)}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {onReset || showBackHomeLink ? (
        <EmptyContent>
          {onReset ? (
            <Button
              variant="secondary"
              icon={resetButtonIcon}
              onClick={onReset}
            >
              {resetButtonMessage}
            </Button>
          ) : null}
          {showBackHomeLink ? (
            <EmptyDescription>
              <Link to="/">Go back to homepage</Link>
            </EmptyDescription>
          ) : null}
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
