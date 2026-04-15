import { HeadContent, Outlet, createRootRoute } from '@tanstack/react-router'

import { ErrorMessage } from '@/components/ui/error-message'
import { Spinner } from '@/components/ui/spinner'
import { authClient } from '@/lib/auth'

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
  errorComponent: ({ error, reset }) => {
    return (
      <div className="h-screen flex items-center justify-center">
        <ErrorMessage
          title="Failed to load application"
          error={error}
          onReset={reset}
          showBackHomeLink={false}
        />
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
