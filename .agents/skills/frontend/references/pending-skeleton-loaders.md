# Pending skeleton loaders

Use `Skeleton` from `@/components/ui/skeleton` for route `pendingComponent` states. Skeleton placeholders should mirror the loaded page layout so the transition feels stable — not a centered spinner.

Reserve `Spinner` for inline actions (button pending, mutation in progress) or full-screen auth/bootstrap gates (`__root`, `beforeLoad`).

## `Skeleton` API

```tsx
import { Skeleton } from '@/components/ui/skeleton'

// className controls size and shape — it is a styled div
<Skeleton className="h-4 w-48" />
<Skeleton className="size-10 rounded-full" />
```

## Route `pendingComponent`

TanStack Router renders `pendingComponent` while the route `loader` is running. Define a skeleton that matches the page chrome.

### Simple page (header + list)

Notifications page shape: `PageHeader` + stacked cards.

```tsx
import { createFileRoute } from '@tanstack/react-router'

import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_app/notifications')({
  loader: () => getNotificationsFromQueryClient(),
  pendingComponent: NotificationsPageSkeleton,
  component: NotificationsPage,
})

function NotificationsPageSkeleton() {
  return (
    <div>
      <PageHeader
        icon={<Skeleton className="size-5 rounded-md" />}
        title={<Skeleton className="h-7 w-40" />}
        description={<Skeleton className="h-4 w-64" />}
        extraContent={<Skeleton className="h-9 w-36 rounded-md" />}
      />

      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-xl border p-4"
          >
            <Skeleton className="size-5 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full max-w-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Page with a grid or table

Match column count and row height:

```tsx
function ProjectsPageSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
```

## Colocate complex skeletons

When the skeleton is non-trivial, colocate it in `-components/` next to the route:

```
src/routes/_app/notifications/
├── index.tsx
└── -components/
    ├── notifications-page-skeleton.tsx
    └── notification-list.tsx
```

**index.tsx**

```tsx
import { NotificationsPageSkeleton } from './-components/notifications-page-skeleton'

export const Route = createFileRoute('/_app/notifications')({
  loader: () => getNotificationsFromQueryClient(),
  pendingComponent: NotificationsPageSkeleton,
  component: NotificationsPage,
})
```

## Rules

1. **Mirror layout** — skeleton blocks should match real content regions (header, sidebar, list rows, cards).
2. **Use `Skeleton` for pages** — `pendingComponent` on data-loaded routes gets a skeleton, not `Spinner`.
3. **Fixed item count** — render 3–6 placeholder rows/cards; exact count is not important.
4. **Reuse page chrome** — pass `<Skeleton />` into slots like `PageHeader` `icon`/`title`/`description` when the real page uses `PageHeader`.
5. **Colocate** — extract to `-components/<page>-skeleton.tsx` when the skeleton exceeds ~15 lines.
6. **Spinner stays inline** — mutations, form submits, and root auth gates keep using `Spinner`.

## Anti-patterns

```tsx
// BAD: generic centered spinner for a page with known layout
pendingComponent: () => (
  <div className="flex items-center justify-center">
    <Spinner />
  </div>
)

// GOOD: layout-shaped skeleton
pendingComponent: NotificationsPageSkeleton
```

```tsx
// BAD: skeleton with no size
<Skeleton />

// GOOD: explicit dimensions
<Skeleton className="h-4 w-48" />
```
