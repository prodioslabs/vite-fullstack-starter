# Project structure reference

Client root: `apps/client/src/`

```
src/
├── components/           # shared components (2+ pages or cross-feature)
│   ├── ui/               # primitives & generic layout (shadcn, page-header, …)
│   ├── app-shell/        # feature component with private sub-components
│   ├── notification-card/
│   └── pdf-viewer/
├── hooks/                # shared query keys, data helpers, UI hooks
├── lib/                  # hono client, auth, env, utils
├── routes/               # TanStack Router file routes
└── styles/
```

---

## Example 1: shared component (2+ pages)

`NotificationCard` is used on the notifications page and could appear elsewhere.

```
src/components/notification-card/
├── index.ts
└── notification-card.tsx
```

**index.ts**

```ts
export { default } from './notification-card'
```

**notification-card.tsx**

```tsx
type NotificationCardProps = {
  notification: { id: string; readAt: Date | string | null }
  title: React.ReactNode
}

export default function NotificationCard({ notification, title }: NotificationCardProps) {
  // mutation + render
}
```

**Consumer** (`routes/_app/notifications.tsx`):

```tsx
import NotificationCard from '@/components/notification-card'
```

---

## Example 2: shared component with private sub-components

`AppShell` owns navigation pieces that no other page uses directly.

```
src/components/app-shell/
├── index.ts
├── app-shell.tsx
└── components/
    ├── nav-link.tsx
    ├── menu-group.tsx
    └── unread-notifications-count.tsx
```

**app-shell.tsx** imports sub-components relatively:

```tsx
import NavLink from './components/nav-link'
import MenuGroup from './components/menu-group'
```

If `nav-link.tsx` is later needed by a different shared component, promote it:

```
src/components/nav-link/
├── index.ts
└── nav-link.tsx
```

Update all imports to `@/components/nav-link`.

---

## Example 3: page with colocated components

A notifications page with parts that are not reused elsewhere.

**Before** (logic inlined in one file — fine for tiny pages):

```
src/routes/_app/notifications.tsx
```

**After** (page grows — split into folder + `-components/`):

```
src/routes/_app/notifications/
├── index.tsx
└── -components/
    ├── notification-list.tsx
    └── mark-all-read-button.tsx
```

**index.tsx**

```tsx
import { createFileRoute } from '@tanstack/react-router'

import { getNotificationsFromQueryClient } from '@/hooks/use-notifications'
import { NotificationList } from './-components/notification-list'
import { MarkAllReadButton } from './-components/mark-all-read-button'

export const Route = createFileRoute('/_app/notifications')({
  loader: () => getNotificationsFromQueryClient(),
  component: NotificationsPage,
})

function NotificationsPage() {
  const { notifications } = Route.useLoaderData()

  return (
    <div>
      <MarkAllReadButton />
      <NotificationList notifications={notifications} />
    </div>
  )
}
```

**-components/notification-list.tsx**

```tsx
import NotificationCard from '@/components/notification-card'

type Props = { notifications: Array<{ id: string }> }

export function NotificationList({ notifications }: Props) {
  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <NotificationCard key={n.id} notification={n} title={n.id} />
      ))}
    </div>
  )
}
```

`-components/` may import from `@/components/` (shared) but not the other way around.

---

## Example 4: when to promote vs keep local

| Component | Used by | Location |
|-----------|---------|----------|
| `MarkAllReadButton` | notifications page only | `routes/_app/notifications/-components/` |
| `NotificationList` | notifications page only | `routes/_app/notifications/-components/` |
| `NotificationCard` | notifications + dashboard | `src/components/notification-card/` |
| `NavLink` | app-shell only | `src/components/app-shell/components/` |
| `NavLink` | app-shell + settings sidebar | `src/components/nav-link/` |
| `Button` | everywhere | `src/components/ui/button.tsx` |

---

## Example 5: data fetching layout

```
src/
├── hooks/
│   └── use-notifications.ts     # NOTIFICATIONS_KEY, getNotificationsFromQueryClient()
├── lib/
│   ├── hono.ts                  # honoClient, getDataOrThrow
│   └── query.ts                 # queryClient singleton
└── routes/
    └── _app/
        └── notifications/
            ├── index.tsx        # loader calls getNotificationsFromQueryClient()
            └── -components/
                └── notification-list.tsx   # receives data via props, no fetch
```

**use-notifications.ts**

```ts
export const NOTIFICATIONS_KEY = ['notifications']
export const UNREAD_NOTIFICATIONS_KEY = [...NOTIFICATIONS_KEY, 'unread']

export function getNotificationsFromQueryClient() {
  return queryClient.ensureQueryData({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () =>
      getDataOrThrow(honoClient.api.notification.$get({ query: {} })),
  })
}
```

Page components receive data from the loader. List/item components receive props — they do not fetch unless the fetch is truly local to that widget and never needed at route level.

---

## Naming conventions

| Item | Convention | Example |
|------|------------|---------|
| Shared component dir | kebab-case | `notification-card/` |
| Component file | matches dir name | `notification-card.tsx` |
| Barrel export | `index.ts` | `export { default } from './notification-card'` |
| Page-only dir | `-components/` | `routes/_app/foo/-components/` |
| Private sub-components | `components/` inside parent | `app-shell/components/` |
| Hooks | `use-<name>.ts` | `use-notifications.ts` |
| Path alias | `@/` → `src/` | `@/components/notification-card` |

---

## Anti-patterns

```tsx
// BAD: import inner file directly
import NotificationCard from '@/components/notification-card/notification-card'

// GOOD: import via directory barrel
import NotificationCard from '@/components/notification-card'
```

```
# BAD: page-only component in shared components
src/components/mark-all-read-button/

# GOOD: colocate with page
src/routes/_app/notifications/-components/mark-all-read-button.tsx
```

```
# BAD: fetch in useEffect
useEffect(() => { fetch('/api/...') }, [])

# GOOD: route loader + TanStack Query
loader: () => getNotificationsFromQueryClient()
```

```tsx
// BAD: default export missing from shared component structure
src/components/foo/Foo.tsx   // no index.ts, PascalCase dir

// GOOD
src/components/foo/
├── index.ts                 // export { default } from './foo'
└── foo.tsx
```
