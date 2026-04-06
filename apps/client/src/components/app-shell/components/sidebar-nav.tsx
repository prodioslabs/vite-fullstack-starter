import { useMatchRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import type { NavItem } from '../types'

import NavLink from './nav-link'

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
} from '@/components/ui/sidebar'

export function SidebarNav({
  label,
  items,
  role,
}: {
  label?: string
  items: NavItem[]
  // TODO: update UserRole from server
  role: any
}) {
  const visible = items.filter((item) => item.availableForRoles.includes(role))

  const matchRoute = useMatchRoute()

  if (visible.length === 0) {
    return null
  }

  return (
    <SidebarGroup>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {visible.map((item, index) => {
          if (!item.children) {
            return (
              <NavLink
                {...item.href}
                icon={item.icon}
                key={`${item.label}-${index}`}
              >
                {item.label}
              </NavLink>
            )
          }

          const visibleChildren = item.children.filter((c) =>
            c.availableForRoles.includes(role),
          )

          if (visibleChildren.length === 0) {
            return null
          }

          const groupActive = visibleChildren.some((c) => matchRoute(c.href))

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
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {visibleChildren.map((child, index) => (
                      // <MatchRoute
                      //   key={`${child.label}-${index}`}
                      //   to={child.href.to}
                      //   params={child.href.params}
                      // >
                      //   {(matched) => {
                      //     return (
                      //       <SidebarMenuSubItem>
                      //         <SidebarMenuSubButton
                      //           asChild
                      //           isActive={!!matched}
                      //         >
                      //           <Link {...child.href}>
                      //             <child.icon />
                      //             <span>{child.label}</span>
                      //           </Link>
                      //         </SidebarMenuSubButton>
                      //       </SidebarMenuSubItem>
                      //     )
                      //   }}
                      // </MatchRoute>
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
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
