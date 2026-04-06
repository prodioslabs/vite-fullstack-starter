import type { Auth } from '../lib/auth'

export type AuthSession = NonNullable<
  Awaited<ReturnType<Auth['api']['getSession']>>
>
export type Session = AuthSession['session']
export type User = AuthSession['user']

export type AppContext = { session: Session; user: User }
