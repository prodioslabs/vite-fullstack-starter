import { createFileRoute, Link, Outlet, redirect, ToPathOption, useNavigate } from '@tanstack/react-router'
import { LucideIcon, HomeIcon, SettingsIcon, ShoppingCartIcon, SearchIcon, UserIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Spinner,
} from '@repo/ui'
import { useQueryClient } from '@tanstack/react-query'
import { CURRENT_USER_KEY } from '../hooks/use-current-user'
import { client } from '../lib/client'
import { Logo } from '../components/icons'

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

    return user.body
  },
})

type AppShellItem =
  | {
      type: 'link'
      icon: LucideIcon
      path: ToPathOption
    }
  | { type: 'spacer' }

const APP_SHELL_ITEMS: AppShellItem[] = [
  {
    type: 'link',
    icon: HomeIcon,
    path: '/',
  },
  {
    type: 'link',
    icon: ShoppingCartIcon,
    path: '/cart',
  },
  {
    type: 'spacer',
  },
  {
    type: 'link',
    icon: SettingsIcon,
    path: '/settings',
  },
]

function AppShell() {
  const userData = Route.useLoaderData()

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const logoutMutation = client.auth.logout.useMutation()

  return (
    <div className="flex h-screen">
      <div className="p-2 border-r space-y-4 flex flex-col">
        <Logo className="w-7 h-7 mx-auto text-primary" />
        {APP_SHELL_ITEMS.map((item, index) => {
          if (item.type === 'link') {
            return (
              <Link key={`link-${item.path}-${index}`} to={item.path} className="p-1.5 block">
                <item.icon className="w-5 h-5" />
              </Link>
            )
          }

          if (item.type === 'spacer') {
            return <div key={`spacer-${index}`} className="flex-1" />
          }

          return null
        })}
      </div>
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-end p-2 gap-4">
          <div className="w-64 flex items-center px-2.5 py-1.5 rounded-md border gap-2 focus-within:ring-ring focus-within:ring-1 focus-within:ring-offset-1">
            <SearchIcon className="w-4 h-4 text-muted-foreground focus-within:ring-ring" />
            <input
              placeholder="Search..."
              className="flex-1 text-foreground outline-none focus-visible:outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full border block focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-1 focus-visible:ring-offset-1">
                <UserIcon className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem disabled>
                <div>
                  <div>{userData?.user?.name}</div>
                  <div className="font-medium">{userData?.user?.email}</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logoutMutation.mutateAsync({}).then(() => {
                    queryClient.removeQueries()
                    navigate({ to: '/login' })
                  })
                }}
                className="gap-2"
              >
                <span className="flex-1">Logout</span>
                {logoutMutation.isPending ? <Spinner className="w-4 h-4" /> : null}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
