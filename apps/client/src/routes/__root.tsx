import { HeadContent, Outlet, createRootRoute } from '@tanstack/react-router'

import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth-client'

export const Route = createRootRoute({
  component: () => <Root />,
  beforeLoad: async () => {
    const { data } = await authClient.getSession()
    return { user: data?.user }
  },
  pendingComponent: () => {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2">
        <Spinner />
        <div className="text-xs text-muted-foreground">Authenticating...</div>
      </div>
    )
  },
})

function Root() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  )
}
