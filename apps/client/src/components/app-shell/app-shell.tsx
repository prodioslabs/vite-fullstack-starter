import { FolderKanbanIcon, HomeIcon, LayersIcon } from 'lucide-react'

import { AppSidebar } from './components/app-sidebar'
import type { NavItem } from './types'

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const APP_SHELL_NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    icon: <HomeIcon />,
    href: {
      to: '/',
    },
    availableForRoles: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  },
  {
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

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar navItems={APP_SHELL_NAV_ITEMS} />
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
