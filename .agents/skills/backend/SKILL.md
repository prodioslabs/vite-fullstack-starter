---
name: backend
description: Backend conventions for the Hono server app — module layout, routers, middleware, cron jobs, and BullMQ workers. Use when creating or refactoring any backend route, worker, cron job, or server module in apps/server/src/.
---

# Backend

Apply these conventions for all work in `apps/server/src/`.

## Hono API reference

When you need Hono API details (handlers, middleware, context, streaming, errors, etc.), fetch:

https://hono.dev/llms-full.txt

## Module layout

`src/` is organized by **module** (e.g. `captcha/`, `notification/`). Each module may contain:

| File | Purpose |
|------|---------|
| `module.middleware.ts` | Middleware scoped to this module |
| `module.router.ts` | Hono API routes |
| `module.cron.ts` | Cron jobs for this module |
| `module.utils.ts` | Utils used only within this module |
| `module.worker.ts` | BullMQ queue + worker for this module |

**Shared code** used across multiple modules belongs in `src/lib/`, not in a module's utils file.

```
apps/server/src/
├── app.ts                  # mount routers, global middleware, onError
├── cron.ts                 # bootstrapCronJobs — register all crons
├── worker.ts               # bootstrapWorkers — register all workers
├── index.ts                # start HTTP / cron / workers based on env
├── lib/                    # shared utilities (db, logger, mq, cron, …)
└── <module>/
    ├── <module>.router.ts
    ├── <module>.middleware.ts   # optional
    ├── <module>.cron.ts         # optional
    ├── <module>.utils.ts        # optional
    └── <module>.worker.ts       # optional
```

## Routers (`module.router.ts`)

- Export a named router: `export const captchaRouter = new Hono()…`
- Use **named async functions** for route handlers (not anonymous arrows).
- Validate input with `zValidator` from `@hono/zod-validator` and `z` from `zod`.
- Read validated data via `c.req.valid('query' | 'json' | 'param')`.
- Throw `HTTPException` from `hono/http-exception` for HTTP errors.
- Log with `logger` from `../lib/logger`; set `component` to the handler name and include `requestId` when available (`c.get('requestId')`).
- Mount the router in `app.ts`: `.route('/<path>', <module>Router)`.

### Param / query / body validation

```ts
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as z from 'zod'

import { logger } from '../lib/logger'

export const exampleRouter = new Hono()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        limit: z.coerce.number().optional().default(20),
        offset: z.coerce.number().optional().default(0),
      }),
    ),
    async function listItems(c) {
      const component = 'listItems'
      const requestId = c.get('requestId')
      const { limit, offset } = c.req.valid('query')

      logger.info({ component, requestId, limit, offset }, 'listing items')
      // …
      return c.json({ items: [] })
    },
  )
  .get(
    '/:id',
    zValidator('param', z.object({ id: z.uuid() })),
    async function getItem(c) {
      const { id } = c.req.valid('param')
      // …
      return c.json({ id })
    },
  )
  .post(
    '/',
    zValidator('json', z.object({ name: z.string().min(1) })),
    async function createItem(c) {
      const body = c.req.valid('json')
      // …
      return c.json({ success: true }, 201)
    },
  )
```

See `captcha/captcha.router.ts` and `notification/notification.router.ts` for full examples.

## Middleware (`module.middleware.ts`)

- Use `createMiddleware` from `hono/factory` with `Variables: AppContext` when the module needs typed context.
- Use a **named async function** for the middleware body.
- Throw `HTTPException` for auth/validation failures; call `next()` on success.

```ts
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import type { AppContext } from '../lib/context'
import { logger } from '../lib/logger'

export const exampleMiddleware = createMiddleware<{
  Variables: AppContext
}>(async function exampleMiddleware(c, next) {
  const component = 'exampleMiddleware'
  const requestId = c.get('requestId')

  // validate, mutate context, or short-circuit
  if (!c.req.header('X-Example')) {
    logger.error({ requestId, component }, 'missing header')
    throw new HTTPException(403, { message: 'Forbidden' })
  }

  return next()
})
```

See `captcha/captcha.middleware.ts` for a full example.

## Cron jobs (`module.cron.ts`)

- Export a **factory function** that returns a `Cron` instance from `croner`.
- Use schedule constants from `CRON_EXPRESSIONS` in `../lib/cron`.
- Use a **named async function** for the job callback.
- Log with `component` set to the factory/callback name and `app: 'cron'`.
- Register the cron in `src/cron.ts` inside `bootstrapCronJobs()`.

```ts
import { Cron } from 'croner'

import { CRON_EXPRESSIONS } from '../lib/cron'
import { db } from '../lib/db'
import { logger } from '../lib/logger'

export function deleteExpiredItemsCron() {
  return new Cron(
    CRON_EXPRESSIONS.EVERY_HOUR,
    async function deleteExpiredItems() {
      const component = 'deleteExpiredItemsCron'
      const app = 'cron'

      logger.info({ component, app }, 'deleting expired items')
      // … db work …
      logger.info({ component, app, count: 0 }, 'expired items deleted')
    },
  )
}
```

See `captcha/captcha.cron.ts` and `src/cron.ts` for the full pattern.

## Workers (`module.worker.ts`)

- Define a **Zod schema** for job data and export the inferred type.
- Create the queue with `createQueue` from `../lib/mq`.
- Export a **factory function** `create<Module>Worker()` that calls `createWorker` with a **named processor function**.
- Log with `component` set to the processor name and `app: 'worker'` where appropriate.
- Register the worker in `src/worker.ts` inside `bootstrapWorkers()`.

```ts
import * as z from 'zod'

import { db } from '../lib/db'
import { logger } from '../lib/logger'
import { createQueue, createWorker } from '../lib/mq'

export const exampleJobDataSchema = z.object({
  type: z.literal('DO_SOMETHING'),
  userId: z.string(),
})

export type ExampleJobData = z.infer<typeof exampleJobDataSchema>

export const exampleQueue = createQueue<ExampleJobData>('EXAMPLE_QUEUE')

export function createExampleWorker() {
  return createWorker<ExampleJobData>(
    exampleQueue.name,
    async function processExample({ data }) {
      const component = 'processExample'

      logger.info(
        { component, userId: data.userId, type: data.type, app: 'worker' },
        'processing job',
      )
      try {
        // … db / side effects …
        logger.info({ component, userId: data.userId }, 'job completed')
      } catch (error) {
        logger.error({ component, error, userId: data.userId }, 'job failed')
      }
    },
  )
}
```

See `notification/notification.worker.ts` and `src/worker.ts` for the full pattern.

## Utils (`module.utils.ts`)

- Keep helpers that are **only used within one module** here.
- If a util is needed by two or more modules, move it to `src/lib/`.

## Database schema

Drizzle schemas live in `apps/server/src/db/schema/`. Export new tables from `schema/index.ts`. Import `db` from `../lib/db` (or `../../lib/db` from routers/workers).

**Do not** edit or create files under `src/db/migrations/` manually — Drizzle Kit generates those from schema changes.

After adding or changing schema files, **do not run** `db:generate` or `db:migrate` yourself. Ask the user to run them:

```sh
bun run db:generate
bun run db:migrate
```

These can be run from the repo root or from `apps/server`.

## Checklist for new backend features

```
New module or endpoint
├─ Routes?
│  ├─ Add <module>.router.ts (named handlers, zValidator, logging)
│  └─ Mount in app.ts with .route()
├─ Module-specific middleware?
│  └─ Add <module>.middleware.ts (createMiddleware, AppContext)
├─ Scheduled task?
│  ├─ Add <module>.cron.ts (Cron + CRON_EXPRESSIONS)
│  └─ Register in src/cron.ts → bootstrapCronJobs()
├─ Background job?
│  ├─ Add <module>.worker.ts (zod schema, createQueue, createWorker)
│  └─ Register in src/worker.ts → bootstrapWorkers()
├─ Shared helper needed elsewhere?
│  └─ Move to src/lib/
└─ Database schema change?
   ├─ Add or update files in src/db/schema/
   ├─ Export from src/db/schema/index.ts
   ├─ Do not write or edit src/db/migrations/ by hand
   └─ Ask the user to run `bun run db:generate` then `bun run db:migrate`
```
