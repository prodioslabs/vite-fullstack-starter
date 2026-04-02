import type { UserRole } from '@repo/contracts'
import type { LinkProps } from '@tanstack/react-router'

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
