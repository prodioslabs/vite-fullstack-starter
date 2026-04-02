import type { User } from '@repo/contracts'
import { Link } from '@tanstack/react-router'

import type { NavItem } from '../types'

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
} from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  navItems: NavItem[]
}

export function AppSidebar({ navItems, ...rest }: AppSidebarProps) {
  const { data: session } = authClient.useSession()

  if (!session) {
    return null
  }

  const user = session.user as User

  return (
    <Sidebar collapsible="icon" variant="floating" {...rest}>
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
        <SidebarNav items={navItems} role={user.role} />
      </SidebarContent>

      {user ? (
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      ) : null}
    </Sidebar>
  )
}
