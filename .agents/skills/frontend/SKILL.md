---
name: frontend
description: Frontend conventions for the Vite client app — component colocation, page structure, PageContainer, Breadcrumb, and PageHeader layout, shared components, and server data fetching. Use when creating or refactoring components or pages, organizing frontend files, or fetching data from the server.
---

# Frontend

Apply these conventions for all work in `apps/client/src/`.

## Quick rules

1. **Colocate by default** — keep files close to where they are used.
2. **Page-only components** → `-components/` next to the route file.
3. **Used on 2+ pages** → `src/components/<component-name>/`.
4. **Private to a shared component** → subfolder inside that component's directory.
5. **Promote when reused** — if a private component is needed elsewhere, move it to `src/components/`.
6. **Data fetching** — route loaders + TanStack Query + `honoClient`; never `useEffect` for fetch (see `no-use-effect` skill).
7. **Composition over variants** — shared behavior + different chrome → file-local base + render props + separate exports; not `variant` switches. See [composition-over-variants.md](references/composition-over-variants.md).
8. **Prop types** — `Component` → `ComponentProps`; wrap with `React.PropsWithChildren` when needed; UI components also use `WithBasicProps` from `@/lib/utils`.
9. **No external layout** — components must not own margin, position, or offset relative to their parent; the parent sets spacing and placement.
10. **Page layout** — every route page uses `PageContainer` as the root wrapper, `Breadcrumb` (`@/components/ui/breadcrumb`) as the first child, then `PageHeader` (`@/components/ui/page-header`) with a `title` and `description`.

## Decision tree

```
New UI piece
├─ Used on one page only?
│  └─ Put in routes/.../-components/
├─ Used on 2+ pages?
│  └─ Put in src/components/<kebab-name>/
└─ Only used inside one shared component?
   ├─ Still needed only there → colocate in that component's directory
   └─ Needed by other shared components → promote to src/components/
```

## Shared component directory

Every shared component lives at `src/components/<component-name>/` (kebab-case):

```
src/components/notification-card/
├── index.ts                    # export { default } from './notification-card'
└── notification-card.tsx       # default export, component definition
```

**index.ts** always re-exports the default:

```ts
export { default } from './notification-card'
```

**Import** via the directory (not the inner file):

```tsx
import NotificationCard from '@/components/notification-card'
```

Private sub-components for a shared component stay in the same directory, or in a `components/` subfolder when there are many (see `app-shell`):

```
src/components/app-shell/
├── index.ts
├── app-shell.tsx
└── components/                 # only used by app-shell
    ├── nav-link.tsx
    └── menu-group.tsx
```

If any file in `app-shell/components/` is needed by another shared component or page, move it to `src/components/<name>/`.

## Page components (`-components/`)

TanStack Router ignores directories prefixed with `-`. Use `-components/` for UI that belongs to a single page.

Convert a flat route to a folder when the page grows:

```
src/routes/_app/notifications/
├── index.tsx                   # route definition + page component
└── -components/
    ├── notification-list.tsx
    └── mark-all-read-button.tsx
```

`-components/` files import each other with relative paths. The route file imports from `./-components/...`.

Do **not** put page-only components in `src/components/`.

## Route pages

Every route `component` (the page function) must wrap its rendered output in `PageContainer`, include a `Breadcrumb` as the first child, then `PageHeader`.

```tsx
import { Link } from '@tanstack/react-router'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { PageContainer } from '@/components/ui/page-container'
import { PageHeader } from '@/components/ui/page-header'

function NotificationsPage() {
  return (
    <PageContainer>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Notifications</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        icon={<BellIcon />}
        title="Notifications"
        description="Everything that needs your attention"
      />
      <NotificationList notifications={notifications} />
    </PageContainer>
  )
}
```

### `PageContainer`

- **Always** use `PageContainer` as the root element of the page component — not a bare `<div>`, fragment, or custom wrapper with page-level padding/margins.
- Let `PageContainer` own page padding (`p-6`) and gap between direct children (`gap-4`); do not duplicate with `space-y-*`, `mt-*`, or outer `p-*` on the page root.
- Use an inner wrapper only when a subsection needs its own layout (e.g. `space-y-3` between list items).
- Override spacing via `className` on `PageContainer` only when a page genuinely needs different gaps — prefer the defaults.
- `pendingComponent` and `errorComponent` are full-page states and do **not** use `PageContainer` unless they mirror the normal page layout (see [pending-skeleton-loaders.md](references/pending-skeleton-loaders.md)).

### `Breadcrumb`

Every route page includes a `Breadcrumb` immediately inside `PageContainer`, before `PageHeader`. It shows where the user is in the app hierarchy.

| Case | Structure |
|------|-----------|
| Top-level route (e.g. Home at `/`) | Single `BreadcrumbPage` — no parent link |
| Nested route (e.g. `/projects`, `/notifications`) | `BreadcrumbLink` → Home, `BreadcrumbSeparator`, `BreadcrumbPage` for the current page |

Rules:

- Import primitives from `@/components/ui/breadcrumb`: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`.
- Use TanStack Router `Link` with `BreadcrumbLink asChild` for navigable ancestors — never a raw `<a>`.
- Label the current page with `BreadcrumbPage`. Match the `PageHeader` `title` and the sidebar nav label in `app-shell` (e.g. "All Projects", "Notifications").
- Home is always the root ancestor for nested routes: `<Link to="/">Home</Link>`.
- Do not duplicate the breadcrumb inside `PageHeader` or roll a custom trail — use the `Breadcrumb` primitives for consistency.

```tsx
// Top-level route (Home)
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbPage>Home</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

// Nested route
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link to="/">Home</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>All Projects</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### `PageHeader`

Every route page includes `PageHeader` immediately after `Breadcrumb`. It sets the page name and a one-line summary for the user.

| Prop | Required | Guidance |
|------|----------|----------|
| `title` | yes | Human-readable page name. Match the sidebar/nav label when the route is linked from the app shell (e.g. nav "All Projects" → `title="All Projects"`). Use title case. |
| `description` | yes | One short sentence: what the page is for or what the user can do here. Not a repeat of the title — add context (e.g. "Everything that needs your attention", "All projects assigned to you"). |
| `icon` | recommended | Lucide icon for the page. Use the same icon as the matching nav item in `app-shell` when one exists. |
| `extraContent` | optional | Page-level actions aligned to the right of the header (e.g. "Mark all as read" on notifications). Keep primary page content below the header. |

```tsx
// List page with a header action
<PageHeader
  icon={<BellIcon />}
  title="Notifications"
  description="Everything that needs your attention"
  extraContent={
    <Button variant="outline" onClick={markAllAsRead}>
      Mark all as read
    </Button>
  }
/>

// Simple page
<PageHeader
  icon={<LayersIcon />}
  title="All Projects"
  description="All projects assigned to you"
/>
```

Do **not** roll a custom heading block (`<h1>`, ad-hoc flex rows, etc.) when `PageHeader` covers the page title — use `PageHeader` for consistency.

## Component prop types

Colocate the props type in the same file as the component. Name it after the component: if the component is `NotificationCard`, the type is `NotificationCardProps`.

### Naming

```tsx
type NotificationCardProps = {
  notification: Notification
  title: React.ReactNode
}

export default function NotificationCard({ notification, title }: NotificationCardProps) {
  // ...
}
```

### `React.PropsWithChildren`

When the component accepts `children`, wrap the props object:

```tsx
type AppShellProps = React.PropsWithChildren<{
  user: User
}>

export default function AppShell({ user, children }: AppShellProps) {
  // ...
}
```

Combine with other wrappers when both apply (see UI components below).

### UI components (`src/components/ui/`)

Primitives and layout helpers in `ui/` should include `className` and `style` via `WithBasicProps` from `@/lib/utils`:

```ts
export type WithBasicProps<T = unknown> = T & {
  className?: string
  style?: React.CSSProperties
}
```

```tsx
import { cn, type WithBasicProps } from '@/lib/utils'

type SpinnerProps = WithBasicProps<{
  size?: number
  stop?: boolean
}>

export function Spinner({ size = 16, stop, className, style }: SpinnerProps) {
  return (
    <div className={cn('inline-flex', className)} style={style}>
      {/* ... */}
    </div>
  )
}
```

With `children`:

```tsx
type MenuGroupProps = React.PropsWithChildren<{
  icon: React.ReactElement<WithBasicProps>
  label: string
}>
```

### Rules

| Component kind | Props type pattern |
|----------------|-------------------|
| Feature / page (`notification-card`, `-components/`) | `ComponentProps` |
| Accepts `children` | `React.PropsWithChildren<{ ... }>` |
| `src/components/ui/*` | `WithBasicProps<{ ... }>` (and `PropsWithChildren` if needed) |

- Define props with `type`, not `interface`.
- Do not inline large prop objects on the function signature — extract `ComponentProps` above the component.
- Feature components outside `ui/` do **not** need `WithBasicProps` unless they intentionally expose `className` / `style` as part of their public API.

## No external layout in components

Components must not bake in **external** layout — spacing or positioning relative to their parent or siblings. That belongs on the parent so the component stays reusable in any context.

### External layout (parent's job)

Avoid on the component root (or as hardcoded defaults):

- Margin: `m-*`, `mt-*`, `mb-*`, `mx-*`, `my-*`, `space-y-*` between siblings
- Positioning in the page: `fixed`, `sticky`, `absolute` on the root (unless the component *is* an overlay primitive)
- Offsets: `top-*`, `bottom-*`, `left-*`, `right-*`, `inset-*`
- Flow: `float-*`, `clear-*`

### Internal layout (OK inside the component)

Structure *within* the component boundary is fine:

- `flex`, `grid`, `gap`, internal `padding` (e.g. `p-4` on a card)
- Positioning children relative to the component root (e.g. a pending `Spinner` in the card corner)

### Example

```tsx
// BAD — card owns page spacing and placement
export default function NotificationCard({ notification, title }: NotificationCardProps) {
  return (
    <div className="mt-6 mb-4 relative top-2 w-full border rounded-xl p-4">
      <div>{title}</div>
    </div>
  )
}

// GOOD — card owns only its own chrome; parent controls layout
export default function NotificationCard({
  notification,
  title,
  className,
}: NotificationCardProps) {
  return (
    <div className={cn('w-full border rounded-xl p-4 flex gap-3', className)}>
      <div>{title}</div>
    </div>
  )
}
```

**Parent** (notifications page):

```tsx
<PageContainer>
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink asChild>
          <Link to="/">Home</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Notifications</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
  <PageHeader
    icon={<BellIcon />}
    title="Notifications"
    description="Everything that needs your attention"
  />
  <div className="space-y-3">
    {notifications.map((notification) => (
      <NotificationCard
        key={notification.id}
        notification={notification}
        title={notification.type}
      />
    ))}
  </div>
</PageContainer>

{/* or one-off placement via className from parent */}
<NotificationCard className="mt-4" notification={notification} title="…" />
```

Expose `className` (via `WithBasicProps` for `ui/` components) so parents can adjust placement when a wrapper is not enough — but never hardcode external layout inside the component.

## `src/components/ui/`

`ui/` holds generic primitives (shadcn, layout helpers like `page-container`, `breadcrumb`, and `page-header`). These are cross-cutting building blocks, not feature components. Do not put feature-specific logic here.

## Data fetching

### Stack

| Layer | Location | Role |
|-------|----------|------|
| HTTP client | `src/lib/hono.ts` | `honoClient`, `getDataOrThrow` |
| Query client | `src/lib/query.ts` | shared `queryClient` |
| Query keys + helpers | `src/hooks/use-<resource>.ts` | keys, `ensureQueryData` helpers |
| Route loader | route file | prefetch via `loader` |
| Component | page or component | `Route.useLoaderData()`, `useMutation` |

### Pattern: read data

**1. Hook** (`src/hooks/use-notifications.ts`):

```ts
import { getDataOrThrow, honoClient } from '@/lib/hono'
import { queryClient } from '@/lib/query'

export const NOTIFICATIONS_KEY = ['notifications']

export function getNotificationsFromQueryClient() {
  return queryClient.ensureQueryData({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () =>
      getDataOrThrow(honoClient.api.notification.$get({ query: {} })),
  })
}
```

**2. Route loader**:

```tsx
export const Route = createFileRoute('/_app/notifications')({
  loader: () => getNotificationsFromQueryClient(),
  pendingComponent: NotificationsPageSkeleton,
  component: NotificationsPage,
})

function NotificationsPage() {
  const { notifications } = Route.useLoaderData()

  return (
    <PageContainer>
      <Breadcrumb>{/* … */}</Breadcrumb>
      <PageHeader
        icon={<BellIcon />}
        title="Notifications"
        description="Everything that needs your attention"
      />
      {/* page content */}
    </PageContainer>
  )
}
```

### Pattern: write data

Use `useMutation` in the component that triggers the action:

```tsx
const markAsReadMutation = useMutation({
  mutationFn: (id: string) =>
    getDataOrThrow(
      honoClient.api.notification['mark-read'].$post({ json: { notificationId: id } }),
    ),
  onSuccess: () => {
    queryClient.refetchQueries({ queryKey: NOTIFICATIONS_KEY })
  },
})
```

Keep mutation logic in the component (or a colocated hook) that owns the UI — not in `src/hooks/` unless the same mutation is shared across pages.

### Rules

- Always use `getDataOrThrow` — never call `res.json()` on error responses manually.
- Export query keys from hooks so mutations can invalidate consistently.
- Prefer route `loader` + `ensureQueryData` for page-level reads.
- Colocate one-off fetch helpers with the page in `-components/` or the route file; promote to `src/hooks/` when reused.
- Use `Skeleton` in route `pendingComponent` to mirror page layout — see [pending-skeleton-loaders.md](references/pending-skeleton-loaders.md).

## Refactoring checklist

When moving or splitting components:

- [ ] New or updated route page? → root wrapped in `PageContainer`, first child is `Breadcrumb`, then `PageHeader` with `title` and `description`
- [ ] Page-only? → `-components/` next to route
- [ ] Used on 2+ pages? → `src/components/<kebab-name>/` with `index.ts` + `<name>.tsx`
- [ ] Sub-component now shared? → promote to `src/components/`
- [ ] Imports updated to use `@/components/<name>` (directory import)
- [ ] Query keys centralized in `src/hooks/` if fetch is shared
- [ ] Props type named `ComponentProps`, `PropsWithChildren` / `WithBasicProps` applied as needed
- [ ] No external layout (`margin`, `position`, offsets) on component — parent owns spacing/placement

## Additional resources

- Full structure reference with examples: [project-structure.md](references/project-structure.md
- Pending skeleton loaders for route `pendingComponent`: [pending-skeleton-loaders.md](references/pending-skeleton-loaders.md)
- Composition over variant switches: [composition-over-variants.md](references/composition-over-variants.md)
