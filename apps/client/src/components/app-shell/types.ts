import type { LinkProps } from '@tanstack/react-router'

import type { UserRole } from '@/lib/auth'
import type { WithBasicProps } from '@/lib/utils'

type BaseItem = {
  availableForRoles: UserRole[]
}

export type NavLink = BaseItem & {
  type: 'LINK'
  label: string
  icon: React.ReactElement<WithBasicProps>
  href: LinkProps
  info?: React.ReactElement<WithBasicProps>
}

type NavMenu = BaseItem & {
  type: 'MENU'
  label: string
  icon: React.ReactElement<WithBasicProps>
  href?: never
  children: NavChild[]
  info?: React.ReactElement<WithBasicProps>
}

export type NavChild = BaseItem & {
  label: string
  icon: React.ReactElement<{ className?: string }>
  href: LinkProps
}

type NavDivider = BaseItem & {
  type: 'DIVIDER'
}

type NavSpacer = BaseItem & {
  type: 'SPACER'
}

export type NavItem = NavLink | NavMenu | NavDivider | NavSpacer
