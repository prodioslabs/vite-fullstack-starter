import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
  beforeLoad: ({ context: { user } }) => {
    if (user) {
      throw redirect({ to: '/', replace: true })
    }
  },
})

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="md:min-w-md p-4 min-w-full">
        <Outlet />
      </div>
    </div>
  )
}
