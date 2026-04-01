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
    <div className="h-screen flex">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Outlet />
      </div>
      <div className="flex-2 hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
          alt="Login screen"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
