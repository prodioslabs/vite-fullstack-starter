import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { CURRENT_USER_KEY } from '../hooks/use-current-user'
import { client } from '../lib/client'

export const Route = createFileRoute('/_app')({
  component: AppShell,
  loader: async ({ context: { queryClient } }) => {
    const user = await queryClient.ensureQueryData({
      queryKey: CURRENT_USER_KEY,
      queryFn: () => client.user.getCurrentUser.query(),
    })

    if (user.status !== 200) {
      throw redirect({
        to: '/login',
      })
    }
  },
})

function AppShell() {
  return (
    <div>
      <div>App Shell</div>
      <Outlet />
    </div>
  )
}
