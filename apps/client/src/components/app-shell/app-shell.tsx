import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useMatchRoute, useNavigate } from '@tanstack/react-router'
import {
  ChevronRightIcon,
  ChevronsUpDownIcon,
  FolderKanbanIcon,
  HomeIcon,
  LayersIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { match } from 'ts-pattern'

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Logo } from '../ui/logo'

import NavLink from './components/nav-link'
import type { NavItem } from './types'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { authClient, type User } from '@/lib/auth'
import { getErrorMessage, getInitials, invariant } from '@/lib/utils'

const APP_SHELL_NAV_ITEMS: NavItem[] = [
  {
    type: 'LINK',
    label: 'Home',
    icon: <HomeIcon />,
    href: {
      to: '/',
    },
    availableForRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  },
  {
    type: 'MENU',
    label: 'Projects',
    icon: <FolderKanbanIcon />,
    availableForRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
    children: [
      {
        label: 'All Projects',
        icon: <LayersIcon />,
        href: { to: '/projects' },
        availableForRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
      },
    ],
  },
]

type AppShellProps = React.PropsWithChildren<{ user: User }>

export default function AppShell({ user, children }: AppShellProps) {
  const userRole = user.role
  invariant(userRole, 'user role should be present')

  const visible = APP_SHELL_NAV_ITEMS.filter((item) =>
    item.type === 'MENU' || item.type === 'LINK'
      ? item.availableForRoles.includes(userRole)
      : false,
  )

  const matchRoute = useMatchRoute()

  const isMobile = useIsMobile()

  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const signOutMutation = useMutation({
    mutationFn: () => {
      return authClient.signOut()
    },
    onSuccess: () => {
      toast.success('Signed out successfully')
      queryClient.clear()
      navigate({ to: '/login', replace: true })
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error)
      toast.error('Failed to sign out', {
        description: errorMessage,
      })
    },
  })

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center">
                    <Logo className="size-12" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      Vite Full Stack
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      Starter
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {visible.map((item, index) => {
                return match(item)
                  .returnType<React.ReactNode>()
                  .with({ type: 'LINK' }, (item) => {
                    return (
                      <NavLink
                        {...item.href}
                        icon={item.icon}
                        key={`${item.label}-${index}`}
                      >
                        {item.label}
                      </NavLink>
                    )
                  })
                  .with({ type: 'MENU' }, (item) => {
                    const visibleChildren = item.children.filter((c) =>
                      c.availableForRoles.includes(userRole),
                    )

                    if (visibleChildren.length === 0) {
                      return null
                    }

                    const groupActive = visibleChildren.some((c) =>
                      matchRoute(c.href),
                    )

                    return (
                      <Collapsible
                        key={item.label}
                        asChild
                        defaultOpen={groupActive}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.label}
                              isActive={groupActive}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                              <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {visibleChildren.map((child, index) => (
                                <NavLink
                                  {...child.href}
                                  icon={child.icon}
                                  key={`${child.label}-${index}`}
                                >
                                  {child.label}
                                </NavLink>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  })
                  .otherwise(() => null)
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="rounded-full text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? 'bottom' : 'right'}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        {user.image ? (
                          <AvatarImage src={user.image} alt={user.name} />
                        ) : null}
                        <AvatarFallback className="rounded-full text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/">Profile</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      signOutMutation.mutate()
                    }}
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
