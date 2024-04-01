import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useAppStore } from '../stores'

export const Route = createRootRoute({ component: Root })

function Root() {
  const isAuthenticated = useAppStore((store) => store.isAuthenticated)

  if (!isAuthenticated) {
    return (
      <>
        <Outlet />
        {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
      </>
    )
  }

  return (
    <AppShell>
      <>
        <Outlet />
        {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
      </>
    </AppShell>
  )
}

// TODO: Make this appshell
function AppShell({ children }: React.PropsWithChildren) {
  return <div>{children}</div>
}
