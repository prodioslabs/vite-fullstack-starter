import type { event } from '../db/schema'

import type { Session, User } from './auth'

export type AppContext = {
  session: Session
  user: User
  event?: typeof event.$inferSelect
}
