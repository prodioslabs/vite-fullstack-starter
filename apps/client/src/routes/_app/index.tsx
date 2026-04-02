import { createFileRoute } from '@tanstack/react-router'
import { HomeIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/_app/')({
  component: HomePage,
  pendingComponent: () => {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2">
        <Spinner />
        <div className="text-xs text-muted-foreground">Loading...</div>
      </div>
    )
  },
  errorComponent: ({ error, reset }) => (
    <div className="p-4 space-y-2">
      <div className="text-sm text-destructive">{error.message}</div>
      <Button variant="outline" size="sm" onClick={reset}>
        Retry
      </Button>
    </div>
  ),
})

function HomePage() {
  return (
    <div>
      <PageHeader
        icon={<HomeIcon />}
        title="Dashboard"
        description="User dashboard"
      />
    </div>
  )
}
