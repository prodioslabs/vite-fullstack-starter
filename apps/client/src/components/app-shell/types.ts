import type { LinkProps } from '@tanstack/react-router'

import type { UserRole } from '@/lib/auth'

export type NavChild = {
  label: string
  icon: React.ReactElement<{ className?: string }>
  href: LinkProps
  availableForRoles: UserRole[]
}

export type NavItem =
  | {
      type: 'LINK'
      label: string
      icon: React.ReactElement<{ className?: string }>
      href: LinkProps
      children?: never
      availableForRoles: UserRole[]
    }
  | {
      type: 'MENU'
      label: string
      icon: React.ReactElement<{ className?: string }>
      href?: never
      children: NavChild[]
      availableForRoles: UserRole[]
    }
  | { type: 'DIVIDER' }
  | { type: 'SPACER' }
