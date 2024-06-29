import { getUser } from '@/lib/auth'
import { User } from '@/payload/types'

export type UserWithoutSensitiveData = Pick<User, 'id' | 'email' | 'createdAt' | 'updatedAt'> & {}

export type CreateContextOptions = {
  user?: UserWithoutSensitiveData | null
}

export async function createTRPCContext(): Promise<CreateContextOptions> {
  const user = await getUser()
  return { user }
}
