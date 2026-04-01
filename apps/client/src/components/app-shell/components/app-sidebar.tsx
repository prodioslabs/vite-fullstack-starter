import type { User, UserRole } from '@repo/contracts'
import { Link } from '@tanstack/react-router'
import {
  FolderKanbanIcon,
  ClipboardListIcon,
  CalendarDaysIcon,
  LayersIcon,
  type LucideIcon,
  HomeIcon,
} from 'lucide-react'

import { NavUser } from './nav-user'
import { SidebarNav } from './sidebar-nav'

import { Logo } from '@/components/ui/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'

export type NavChild = {
  label: string
  icon: LucideIcon
  href: string
  availableForRoles: UserRole[]
}

export type NavItem =
  | {
      label: string
      icon: LucideIcon
      href: string
      children?: never
      availableForRoles: UserRole[]
    }
  | {
      label: string
      icon: LucideIcon
      href?: never
      children: NavChild[]
      availableForRoles: UserRole[]
    }

const NAV_MAIN: NavItem[] = [
  {
    label: 'Dashboard',
    icon: HomeIcon,
    href: '/',
    availableForRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  },
  {
    label: 'Projects',
    icon: FolderKanbanIcon,
    availableForRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
    children: [
      {
        label: 'All Projects',
        icon: LayersIcon,
        href: '/projects',
        availableForRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        label: 'My Projects',
        icon: FolderKanbanIcon,
        href: '/projects/mine',
        availableForRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
      },
      {
        label: 'Timeline',
        icon: CalendarDaysIcon,
        href: '/projects/timeline',
        availableForRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
      },
    ],
  },
  {
    label: 'Tasks',
    icon: ClipboardListIcon,
    availableForRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
    children: [
      {
        label: 'All Tasks',
        icon: ClipboardListIcon,
        href: '/tasks',
        availableForRoles: ['ADMIN', 'SUPER_ADMIN'],
      },
      {
        label: 'My Tasks',
        icon: ClipboardListIcon,
        href: '/tasks/mine',
        availableForRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession()
  const user = session?.user as User
  const role = user?.role

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
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
        <SidebarNav items={NAV_MAIN} role={role!} />
      </SidebarContent>

      {user ? (
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      ) : null}

      <SidebarRail />
    </Sidebar>
  )
}
