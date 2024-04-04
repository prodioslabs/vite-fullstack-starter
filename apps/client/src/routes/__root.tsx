import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Spinner } from '@repo/ui'
import { QueryClient } from '@tanstack/react-query'
import { useCurrentUser } from '../hooks/use-current-user'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({ component: Root })

function Root() {
  const currentUser = useCurrentUser()

  if (currentUser.status === 'pending') {
    return (
      <div className="h-screen flex items-center justify-center gap-2">
        <Spinner />
        <div className="text-xs text-muted-foreground">Authenticating...</div>
      </div>
    )
  }

  return (
    <>
      <Outlet />
      {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
    </>
  )
}
