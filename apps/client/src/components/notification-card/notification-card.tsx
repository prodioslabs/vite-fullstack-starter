import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCheckIcon } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import { cloneElement } from 'react'

import { Spinner } from '@/components/ui/spinner'
import {
  NOTIFICATIONS_KEY,
  UNREAD_NOTIFICATIONS_KEY,
} from '@/hooks/use-notifications'
import { getDataOrThrow, honoClient } from '@/lib/hono'
import { cn } from '@/lib/utils'

type Notification = {
  id: string
  readAt: string | null | Date
  createdAt: string | Date
}

type NotificationCardProps = {
  notification: Notification
  title: React.ReactNode
  description?: React.ReactNode
  notificationIcon?: React.ReactElement<LucideProps>
  onNotificationRead?: () => void
  className?: string
  style?: React.CSSProperties
}

export default function NotificationCard({
  notification,
  title,
  description,
  notificationIcon,
  onNotificationRead,
  className,
  style,
}: NotificationCardProps) {
  const queryClient = useQueryClient()

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      getDataOrThrow(
        honoClient.api.notification['mark-read'].$post({
          json: { notificationId },
        }),
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: UNREAD_NOTIFICATIONS_KEY }),
        queryClient.refetchQueries({ queryKey: NOTIFICATIONS_KEY }),
      ])
      onNotificationRead?.()
    },
  })

  return (
    <div
      onClick={() => {
        if (!notification.readAt) {
          markAsReadMutation.mutate(notification.id)
        }
      }}
      className={cn(
        'cursor-pointer border rounded-xl w-full p-4 flex gap-3 text-sm items-start relative',
        { 'opacity-40': !!notification.readAt },
        className,
      )}
      style={style}
    >
      {notificationIcon
        ? cloneElement(notificationIcon, {
            className: cn(
              'size-5 text-primary shrink-0 mt-0.5',
              notificationIcon.props.className,
            ),
          })
        : null}

      <div className="flex-1">
        <div>{title}</div>
        {description ? (
          <div className="text-muted-foreground mt-1">{description}</div>
        ) : null}
        {notification.readAt ? (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground justify-end">
            <CheckCheckIcon className="size-3 text-primary" />
            <div>{new Date(notification.readAt).toLocaleString()}</div>
          </div>
        ) : null}
      </div>

      {markAsReadMutation.isPending ? (
        <Spinner className="size-3 absolute top-2 right-2" />
      ) : null}
    </div>
  )
}
