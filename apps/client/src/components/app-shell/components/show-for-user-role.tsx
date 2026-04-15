import { useRouteContext } from '@tanstack/react-router'
import { useMemo } from 'react'

import type { UserRole } from '@/lib/auth'
import { invariant } from '@/lib/utils'

type ShowForUserProps = React.PropsWithChildren<{
  roles: UserRole[]
}>

export default function ShowForUserRole({ roles, children }: ShowForUserProps) {
  const { user } = useRouteContext({ from: '/_app' })
  const userRole = user.role
  invariant(userRole, 'userRole should be present')

  const showChild = useMemo(() => roles.includes(userRole), [roles, userRole])

  if (showChild) {
    return children
  }

  return null
}
