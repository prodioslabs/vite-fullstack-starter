import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'

import { Spinner } from '@/components/ui/spinner'
import { UNREAD_NOTIFICATIONS_KEY } from '@/hooks/use-notifications'
import { getDataOrThrow, honoClient } from '@/lib/hono'
import { cn, type WithBasicProps } from '@/lib/utils'

export default function UnreadNotificationsCount({
  className,
  style,
}: WithBasicProps) {
  const getUnreadNotificationsQuery = useQuery({
    queryKey: UNREAD_NOTIFICATIONS_KEY,
    queryFn: () => getDataOrThrow(honoClient.api.notification.count.$get()),
  })

  return (
    <div className={cn('inline-block', className)} style={style}>
      {match(getUnreadNotificationsQuery)
        .returnType<React.ReactNode>()
        .with({ status: 'pending' }, () => <Spinner className="w-3 h-3" />)
        .with({ status: 'success' }, ({ data }) => (
          <div className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
            {data.count}
          </div>
        ))
        .otherwise(() => null)}
    </div>
  )
}
