import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import AppShell from '@/components/app-shell'

export const Route = createFileRoute('/_app')({
  head: () => ({ meta: [{ title: 'Fullstack Starter' }] }),
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login', replace: true })
    }
  },
  loader: ({ context: { user } }) => {
    return { user }
  },
  component: () => {
    return <AppLayout />
  },
})

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
