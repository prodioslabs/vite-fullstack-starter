import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { CURRENT_USER_KEY } from '../hooks/use-current-user'
import { client } from '../lib/client'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
  loader: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      queryKey: CURRENT_USER_KEY,
      queryFn: () => client.user.getCurrentUser.query(),
    })

    if (user.status === 200) {
      throw redirect({
        to: '/',
      })
    }
  },
})

function AuthLayout() {
  return (
    <div className="h-screen flex">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Outlet />
      </div>
      <div className="flex-[2]">
        <img
          src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2301&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
