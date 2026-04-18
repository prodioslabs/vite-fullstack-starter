import { getDataOrThrow, honoClient } from '@/lib/hono'
import { queryClient } from '@/lib/query'

export const NOTIFICATIONS_KEY = ['notifications']
export const UNREAD_NOTIFICATIONS_KEY = [...NOTIFICATIONS_KEY, 'unread']

export function getNotificationsFromQueryClient() {
  return queryClient.ensureQueryData({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => getDataOrThrow(honoClient.api.notification.$get({ query: {} })),
  })
}
