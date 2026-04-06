import type { LinkProps } from '@tanstack/react-router'

// TODO: update UserRole from server
type UserRole = unknown

export type NavChild = {
  label: string
  icon: React.ReactElement<{ className?: string }>
  href: LinkProps
  availableForRoles: UserRole[]
}

export type NavItem =
  | {
      label: string
      icon: React.ReactElement<{ className?: string }>
      href: LinkProps
      children?: never
      availableForRoles: UserRole[]
    }
  | {
      label: string
      icon: React.ReactElement<{ className?: string }>
      href?: never
      children: NavChild[]
      availableForRoles: UserRole[]
    }
