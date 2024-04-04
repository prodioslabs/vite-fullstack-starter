import { client } from '../lib/client'

export const CURRENT_USER_KEY = ['user', 'me']

export function useCurrentUser() {
  return client.user.getCurrentUser.useQuery(CURRENT_USER_KEY)
}
