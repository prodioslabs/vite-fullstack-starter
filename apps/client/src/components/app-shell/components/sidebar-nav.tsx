import type { UserRole } from '@repo/contracts'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import type { NavItem } from './app-sidebar'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

function isActive(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

export function SidebarNav({
  label,
  items,
  role,
}: {
  label?: string
  items: NavItem[]
  role: UserRole
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const visible = items.filter((item) => item.availableForRoles.includes(role))

  if (visible.length === 0) {
    return null
  }

  return (
    <SidebarGroup>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {visible.map((item) => {
          if (!item.children) {
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href, pathname)}
                  tooltip={item.label}
                >
                  <Link to={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          const visibleChildren = item.children.filter((c) =>
            c.availableForRoles.includes(role),
          )

          if (visibleChildren.length === 0) {
            return null
          }

          const groupActive = visibleChildren.some((c) =>
            isActive(c.href, pathname),
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
                    <item.icon />
                    <span>{item.label}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {visibleChildren.map((child) => (
                      <SidebarMenuSubItem key={child.href}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive(child.href, pathname)}
                        >
                          <Link to={child.href}>
                            <child.icon />
                            <span>{child.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
