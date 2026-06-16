import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BellIcon, MailOpenIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import NotificationCard from '@/components/notification-card/notification-card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { PageContainer } from '@/components/ui/page-container'
import { PageHeader } from '@/components/ui/page-header'
import { Spinner } from '@/components/ui/spinner'
import {
  getNotificationsFromQueryClient,
  NOTIFICATIONS_KEY,
  UNREAD_NOTIFICATIONS_KEY,
} from '@/hooks/use-notifications'
import { getDataOrThrow, honoClient } from '@/lib/hono'

export const Route = createFileRoute('/_app/notifications')({
  loader: () => getNotificationsFromQueryClient(),
  pendingComponent: () => (
    <div className="h-full flex items-center justify-center gap-2">
      <Spinner />
      <div className="text-muted-foreground text-sm">
        Loading notifications...
      </div>
    </div>
  ),
  component: NotificationsPage,
})

function NotificationsPage() {
  const queryClient = useQueryClient()
  const { notifications } = Route.useLoaderData()

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      getDataOrThrow(honoClient.api.notification['mark-all-read'].$post({})),
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: UNREAD_NOTIFICATIONS_KEY }),
        queryClient.refetchQueries({ queryKey: NOTIFICATIONS_KEY }),
      ])
    },
  })

  return (
    <PageContainer>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Notifications</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        icon={<BellIcon />}
        title="Notifications"
        description="Everything that needs your attention"
        extraContent={
          <Button
            variant="outline"
            icon={<MailOpenIcon />}
            disabled={markAllAsReadMutation.isPending}
            onClick={() => markAllAsReadMutation.mutate(undefined)}
          >
            Mark all as read
          </Button>
        }
      />

      <div className="space-y-3">
        {match(notifications)
          .when(
            (n) => n.length === 0,
            () => (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No notifications</EmptyTitle>
                  <EmptyDescription>You're all caught up!</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ),
          )
          .otherwise((list) =>
            list.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                title={
                  <span className="font-medium capitalize">
                    {notification.type.replace(/_/g, ' ').toLowerCase()}
                  </span>
                }
                description={
                  notification.metadata
                    ? JSON.stringify(notification.metadata)
                    : undefined
                }
              />
            )),
          )}
      </div>
    </PageContainer>
  )
}
