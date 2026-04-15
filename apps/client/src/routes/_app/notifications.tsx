import { createFileRoute } from '@tanstack/react-router'
import { BellIcon, MailOpenIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'

export const Route = createFileRoute('/_app/notifications')({
  component: NotificationsPage,
})

function NotificationsPage() {
  return (
    <div>
      <PageHeader
        icon={<BellIcon />}
        title="Notifications"
        description="Everything that needs your attention"
        extraContent={
          <Button variant="outline" icon={<MailOpenIcon />}>
            Mark all as read
          </Button>
        }
      />
    </div>
  )
}
