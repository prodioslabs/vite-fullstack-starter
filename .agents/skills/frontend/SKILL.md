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
7. **Query UI states** — branch on TanStack Query `status` with `match` from `ts-pattern`; derive values from `data` inside `status: 'success'`, not `query.data?.` at the top level.
8. **Composition over variants** — shared behavior + different chrome → file-local base + render props + separate exports; not `variant` switches. See [composition-over-variants.md](references/composition-over-variants.md).
9. **Prop types** — `Component` → `ComponentProps`. If the component accepts `children`, use `React.PropsWithChildren<{ ... }>` — never `children?: React.ReactNode`. If it renders a root element callers may style, wrap with `WithBasicProps` from `@/lib/utils` and merge `className` via `cn()`. When both apply, combine: `WithBasicProps<React.PropsWithChildren<{ ... }>>`.
10. **No external layout** — components must not own margin, position, or offset relative to their parent; the parent sets spacing and placement.
11. **Page layout** — every route page uses `PageContainer` as the root wrapper, `Breadcrumb` (`@/components/ui/breadcrumb`) as the first child, then `PageHeader` (`@/components/ui/page-header`) with a `title` and `description`.

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

**Always apply the wrappers below when they apply.** Do not hand-roll equivalent fields on the props object.

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

### `React.PropsWithChildren` (required when accepting `children`)

When the component accepts `children`, wrap the props object with `React.PropsWithChildren`. **Never** add `children?: React.ReactNode` to the props type directly.

```tsx
// ✅ Correct
type AppShellProps = React.PropsWithChildren<{
  user: User
}>

export default function AppShell({ user, children }: AppShellProps) {
  // ...
}
```

```tsx
// ❌ Wrong — do not declare children on the props object
type AppShellProps = {
  user: User
  children?: React.ReactNode
}
```

### `WithBasicProps` (required for styleable root elements)

Use `WithBasicProps` from `@/lib/utils` when the component renders a root DOM element that callers may need to customize with `className` or `style`. This applies to:

- All primitives and layout helpers in `src/components/ui/`
- Reusable section/layout wrappers in `-components/` or `src/components/` (e.g. `SettingsSection`)

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

Always destructure `className` and `style`, pass `style` to the root element, and merge `className` with defaults via `cn()`.

### Combining `WithBasicProps` and `React.PropsWithChildren`

When a component accepts both `children` and a styleable root, nest the wrappers:

```tsx
import { cn, type WithBasicProps } from '@/lib/utils'

type SettingsSectionProps = WithBasicProps<
  React.PropsWithChildren<{
    title: string
    description: string
  }>
>

export function SettingsSection({
  title,
  description,
  children,
  className,
  style,
}: SettingsSectionProps) {
  return (
    <section
      className={cn('grid gap-8 lg:grid-cols-2', className)}
      style={style}
    >
      {/* ... */}
      <div className="min-w-0">{children}</div>
    </section>
  )
}
```

`WithBasicProps` on the outside is the usual order; inner `React.PropsWithChildren` carries domain props plus `children`.

### Rules

| Component kind | Props type pattern |
|----------------|-------------------|
| Feature / page (`notification-card`, route pages) | `ComponentProps` only |
| Accepts `children` | **Always** `React.PropsWithChildren<{ ... }>` — never `children?: React.ReactNode` |
| `src/components/ui/*` | **Always** `WithBasicProps<{ ... }>` (plus `PropsWithChildren` when needed) |
| Reusable layout/section wrapper (`-components/`, `src/components/`) | `WithBasicProps<{ ... }>` when the root element is styleable (plus `PropsWithChildren` when needed) |

- Define props with `type`, not `interface`.
- Do not inline large prop objects on the function signature — extract `ComponentProps` above the component.
- Leaf feature components that do not accept `children` and have no styleable root (e.g. a card that only receives data props) do **not** need `WithBasicProps` or `PropsWithChildren`.

### Anti-patterns

| Do not | Do instead |
|--------|------------|
| `children?: React.ReactNode` on the props type | `React.PropsWithChildren<{ ... }>` |
| Omit `className` / `style` on a layout wrapper with a root `<section>` / `<div>` | `WithBasicProps<...>` + `cn()` on the root |
| Hardcode root `className` with no merge point | `className={cn('defaults', className)}` |
| Inline props on the function: `function Foo({ x }: { x: string })` | Extract `type FooProps = ...` above the component |

## Revealing pattern (file order)

Order symbols in a file so the **main export appears first** and supporting pieces follow below. A reader opening the file should see the primary component immediately — not scroll past skeletons, sub-components, or helpers to find it.

### Order

1. **Imports**
2. **Module-level constants** — schemas, query keys, static config
3. **Types** — props and value types used by the main component
4. **Main export** — the default export or primary named export the file exists for
5. **Supporting symbols** — in the order they are first referenced by the main component (skeletons, sub-components, hooks, helpers)

### Example

```tsx
// schemas, keys, types at top
const updatePasswordSchema = z.object({ /* … */ })
type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>

export default function UpdatePasswordForm() {
  if (isPending) {
    return <UpdatePasswordFormSkeleton />
  }

  return (/* … */)
}

function UpdatePasswordFormSkeleton() {
  return (/* … */)
}
```

### Rules

- Put the **default export first** among function components in the file.
- Colocated skeletons, sub-components, and private helpers go **after** the main component — not before it.
- Do not hoist supporting components above the main export for “definition before use”; function declarations are hoisted in JS, and the revealing order prioritizes readability over dependency order.
- When a file has multiple private helpers, stack them below the main component in the order the main component references them.

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

### Pattern: query status with `match`

When a component uses `useQuery` and renders different UI per query state, branch with `match` from `ts-pattern` — not `if (query.isPending)`, ternaries, or early returns scattered above the JSX.

Always chain `.returnType<React.ReactNode>()` so every branch returns renderable output.

| `status` | Render |
|----------|--------|
| `pending` | `Skeleton` (or `Spinner` for inline/badge UI) |
| `success` | Loaded content — derive values from destructured `data` here |
| `error` | `ErrorMessage` from `@/components/ui/error-message` with `error` and `onReset={() => void refetch()}` |
| other | `.otherwise(() => null)` only when no UI is appropriate |

**Derive values inside `status: 'success'`** — use the narrowed `data` from the match callback. Do **not** compute them at the top of the component with optional chaining (`query.data?.…`). That bypasses the status guard and forces nullable handling everywhere.

#### Simple read

```tsx
import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'

import { Spinner } from '@/components/ui/spinner'

export default function UnreadNotificationsCount() {
  const unreadQuery = useQuery({
    queryKey: UNREAD_NOTIFICATIONS_KEY,
    queryFn: () => getDataOrThrow(honoClient.api.notification.count.$get()),
  })

  return match(unreadQuery)
    .returnType<React.ReactNode>()
    .with({ status: 'pending' }, () => <Spinner className="size-3" />)
    .with({ status: 'success' }, ({ data }) => (
      <div className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
        {data.count}
      </div>
    ))
    .otherwise(() => null) // inline UI — omit error state
}
```

Inline or badge-sized UI may omit the `error` branch and fall through to `.otherwise(() => null)`.

#### Section UI with skeleton + error recovery

```tsx
import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'

import { ErrorMessage } from '@/components/ui/error-message'

export default function UpdatePasswordForm() {
  const accountsQuery = useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts()
      if (error) throw error
      return data
    },
  })

  return match(accountsQuery)
    .returnType<React.ReactNode>()
    .with({ status: 'pending' }, () => <UpdatePasswordFormSkeleton />)
    .with({ status: 'success' }, ({ data }) => {
      const hasCredentialAccount = data.some(
        (account) => account.providerId === 'credential',
      )
      const formDisabled = !hasCredentialAccount

      return (
        <div className="flex flex-col gap-6">
          {!hasCredentialAccount ? <OAuthOnlyMessage /> : null}
          <PasswordForm disabled={formDisabled} />
        </div>
      )
    })
    .with({ status: 'error' }, ({ error, refetch }) => (
      <ErrorMessage
        title="Unable to load password settings"
        error={error}
        onReset={() => void refetch()}
        showBackHomeLink={false}
      />
    ))
    .otherwise(() => null)
}

function UpdatePasswordFormSkeleton() {
  return (/* … */)
}
```

Use a block body `({ data }) => { … return (…) }` when the success branch needs local constants before JSX.

#### Anti-patterns

```tsx
// BAD — optional chaining at top level; data may be undefined while pending/error
const hasCredentialAccount = accountsQuery.data?.some(
  (account) => account.providerId === 'credential',
)
const formDisabled = accountsQuery.isError || !hasCredentialAccount

if (accountsQuery.isPending) return <UpdatePasswordFormSkeleton />
return <PasswordForm disabled={formDisabled} />

// BAD — ternary instead of explicit status branches
return accountsQuery.isPending ? <Skeleton /> : <Form />

// GOOD — status branches; derived values only in success
return match(accountsQuery)
  .returnType<React.ReactNode>()
  .with({ status: 'pending' }, () => <UpdatePasswordFormSkeleton />)
  .with({ status: 'success' }, ({ data }) => {
    const hasCredentialAccount = data.some(
      (account) => account.providerId === 'credential',
    )
    return <PasswordForm disabled={!hasCredentialAccount} />
  })
  .with({ status: 'error' }, ({ error, refetch }) => (
    <ErrorMessage
      title="Unable to load password settings"
      error={error}
      onReset={() => void refetch()}
      showBackHomeLink={false}
    />
  ))
  .otherwise(() => null)
```

Rules:

- Match on the **query result object** (`match(accountsQuery)`), not individual flags like `isPending`.
- Always handle `status: 'success'` explicitly — do not fold loaded UI into `.otherwise()`.
- For section- or form-level queries, handle `status: 'error'` with `ErrorMessage` — pass `error`, wire `onReset` to `refetch`, and set `showBackHomeLink={false}` when the user is already inside the app shell.
- Colocate skeleton components below the main export (revealing pattern).
- Hooks (`useForm`, `useMutation`, etc.) still run unconditionally **before** the `match` return — only **derived data values** move into the success branch.

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

### Pattern: user feedback with `toast.promise`

For form submissions and other user-initiated writes, surface loading/success/error with `toast.promise` from `sonner` — not separate `toast.success` / `toast.error` calls in `onSuccess` / `onError`.

Wrap `mutateAsync` (not `mutate`) so the toast tracks the promise lifecycle:

```tsx
import { toast } from 'sonner'

import { getErrorMessage } from '@/lib/utils'

const updatePasswordMutation = useMutation({
  mutationFn: (values: UpdatePasswordValues) =>
    getDataOrThrow(
      honoClient.api.user['change-password'].$post({ json: values }),
    ),
})

const handleSubmit = (values: UpdatePasswordValues) => {
  void toast
    .promise(updatePasswordMutation.mutateAsync(values), {
      loading: 'Updating password...',
      success: 'Password updated',
      error: (error) => ({
        message: 'Unable to update password',
        description: getErrorMessage(error),
      }),
    })
    .unwrap()
    .then(() => form.reset())
    .catch((error: unknown) => {
      form.setError('currentPassword', {
        message: getErrorMessage(error),
      })
    })
}
```

Rules:

- Use `toast.promise` for user-facing mutation feedback; keep `onSuccess` only for cache invalidation or other side effects that are not toast messages.
- Chain `.unwrap()` after `toast.promise` to get the underlying promise (sonner v2).
- Return `{ message, description }` from the `error` callback when a title and body are both needed.
- Use `getErrorMessage` for the `description` — never surface raw error objects.
- Reset the form in `.then()` after success; set field errors in `.catch()` when the form should reflect the failure.

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
- [ ] Props type named `ComponentProps`
- [ ] Accepts `children`? → `React.PropsWithChildren<{ ... }>` (never `children?: React.ReactNode`)
- [ ] Styleable root element? → `WithBasicProps<{ ... }>` + `cn()` merge on root (required for `ui/`, layout wrappers in `-components/` / `src/components/`)
- [ ] Both? → `WithBasicProps<React.PropsWithChildren<{ ... }>>`
- [ ] No external layout (`margin`, `position`, offsets) on component — parent owns spacing/placement
- [ ] Main export at top of file? → supporting skeletons, sub-components, and helpers below it (revealing pattern)
- [ ] `useQuery` UI states? → `match(query).returnType<React.ReactNode>()` with explicit `pending` / `success` / `error` branches; derive values from `data` inside `success`, not `query.data?.` at top level; section UI errors use `ErrorMessage` + `refetch`

## Additional resources

- Full structure reference with examples: [project-structure.md](references/project-structure.md
- Pending skeleton loaders for route `pendingComponent`: [pending-skeleton-loaders.md](references/pending-skeleton-loaders.md)
- Composition over variant switches: [composition-over-variants.md](references/composition-over-variants.md)
