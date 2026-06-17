import { getDataOrThrow, honoClient } from '@/lib/hono'
import { queryClient } from '@/lib/query'

export const EVENTS_KEY = ['events'] as const

export function getEventsFromQueryClient() {
  return queryClient.ensureQueryData({
    queryKey: EVENTS_KEY,
    queryFn: () => getDataOrThrow(honoClient.api.event.$get({ query: {} })),
  })
}
