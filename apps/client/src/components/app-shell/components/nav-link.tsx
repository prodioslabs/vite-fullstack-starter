import { Link, type LinkProps, MatchRoute } from '@tanstack/react-router'

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

type NavLinkProps = LinkProps &
  React.PropsWithChildren<{
    icon: React.ReactElement<{ className?: string }>
  }>

export default function NavLink({ icon, children, ...rest }: NavLinkProps) {
  return (
    <MatchRoute to={rest.to} params={rest.params}>
      {(matched) => {
        return (
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={!!matched}
              tooltip={
                typeof children === 'string' ? (
                  children
                ) : (
                  <span>{children}</span>
                )
              }
            >
              <Link {...rest}>
                {icon}
                <span>{children}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      }}
    </MatchRoute>
  )
}
