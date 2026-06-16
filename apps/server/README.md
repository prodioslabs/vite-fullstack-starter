# @repo/server

Bun backend for the vite-fullstack-starter monorepo. A Hono API with Better Auth, Drizzle ORM, BullMQ workers, cron jobs, and file storage via MinIO.

See the [root README](../../README.md) for monorepo setup, infrastructure, and Docker instructions.

## Development

From the repository root:

```bash
bun run --filter=@repo/server dev
```

Or from this directory after installing dependencies at the root:

```bash
bun run dev
```

The HTTP server listens on port `3000` by default.

On startup, `src/index.ts` conditionally bootstraps three subsystems. All three are **enabled by default** (`true`). See [Runtime subsystems](#runtime-subsystems) for details.

## Runtime subsystems

The server process is split into three independently toggled subsystems. Each is controlled by a boolean environment variable (set the string `"true"` or `"false"`). This lets you run everything in one process locally, or split responsibilities across separate deployments in production.

| Variable | Default | Bootstraps |
| --- | --- | --- |
| `ENABLE_HTTP_SERVER` | `true` | Hono API via `Bun.serve` |
| `ENABLE_QUEUE_WORKERS` | `true` | BullMQ job processors |
| `ENABLE_CRON` | `true` | Scheduled tasks via `croner` |

`src/index.ts` starts only the subsystems whose flags are enabled, then registers a shared graceful shutdown handler for `SIGTERM` and `SIGINT` that stops each bootstrapped subsystem in turn.

### `ENABLE_HTTP_SERVER`

When enabled, `src/server.ts` starts the HTTP API on `PORT` (default `3000`) using the Hono app defined in `src/app.ts`.

Responsibilities:

- Serves all API routes (`/health`, `/api/auth`, `/api/captcha`, `/api/files`, `/api/notifications`)
- Handles authentication, file uploads, captcha generation, and notification reads
- Applies middleware for CORS, request IDs, logging, and Redis-backed rate limiting

Requires: `DATABASE_URL`, `HEALTHCHECK_API_KEY`, S3 credentials, and Redis (for rate limiting).

Disable this when running a dedicated worker or cron process that should not accept HTTP traffic.

### `ENABLE_QUEUE_WORKERS`

When enabled, `src/worker.ts` registers BullMQ workers that consume jobs from Redis queues.

Current workers:

| Worker | Queue | What it does |
| --- | --- | --- |
| Notification worker | `NOTIFICATION_QUEUE` | Processes `CREATE_NOTIFICATION` jobs and inserts notification records into PostgreSQL |

Jobs are added to Redis queues by application code and processed asynchronously by these workers. If workers are disabled, queued jobs will accumulate in Redis and not be processed.

Requires: Redis (`REDIS_HOST`, `REDIS_PORT`, etc.) and `DATABASE_URL`.

Disable this on API-only replicas when workers run in a separate process or container.

### `ENABLE_CRON`

When enabled, `src/cron.ts` registers scheduled tasks using [`croner`](https://github.com/Hexagon/croner).

Current jobs:

| Job | Schedule | What it does |
| --- | --- | --- |
| `deleteExpiredCaptchas` | Every hour | Deletes captcha records whose `expiresAt` is in the past |

Cron jobs run in-process and do not use Redis. They only need database access.

Disable this on all but one replica in production — cron jobs should run on a single instance to avoid duplicate executions.

### Deployment examples

**Local development** — leave all flags at their defaults so a single `bun run dev` starts the API, workers, and cron together:

```bash
# all default to true; no need to set explicitly
bun run dev
```

**API-only container** — handle HTTP requests without processing background jobs:

```bash
ENABLE_HTTP_SERVER=true
ENABLE_QUEUE_WORKERS=false
ENABLE_CRON=false
```

**Worker-only container** — process queue jobs without serving HTTP or running cron:

```bash
ENABLE_HTTP_SERVER=false
ENABLE_QUEUE_WORKERS=true
ENABLE_CRON=false
```

**Cron-only container** — run scheduled maintenance on a single instance:

```bash
ENABLE_HTTP_SERVER=false
ENABLE_QUEUE_WORKERS=false
ENABLE_CRON=true
```

## Environment variables

Create a `.env` file in this directory (or set variables in your shell):

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://…`) |
| `HEALTHCHECK_API_KEY` | API key for health checks (min. 32 characters) |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | MinIO / S3 credentials |
| `CORS_ORIGIN` | Allowed CORS origin (default: `http://localhost:5173`) |
| `BETTER_AUTH_URL` | Auth server URL (default: `http://localhost:3000`) |
| `APP_BASE_URL` | Frontend URL for emails and links (default: `http://localhost:5173`) |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB` | Redis connection settings |
| `S3_ENDPOINT`, `S3_PORT`, `S3_BUCKET` | Object storage settings |
| `ENABLE_CRON` | Enable scheduled cron jobs (default: `true`) — see [Runtime subsystems](#runtime-subsystems) |
| `ENABLE_QUEUE_WORKERS` | Enable BullMQ background workers (default: `true`) — see [Runtime subsystems](#runtime-subsystems) |
| `ENABLE_HTTP_SERVER` | Enable the HTTP API server (default: `true`) — see [Runtime subsystems](#runtime-subsystems) |
| `LOKI_HOST`, `LOKI_USERNAME`, `LOKI_PASSWORD` | Optional log shipping to Grafana Loki |
| `SMTP_USER`, `SMTP_PASSWORD` | Optional email delivery |

## Scripts

| Script | Description |
| --- | --- |
| `dev` | Starts the server with Bun in watch mode (`src/index.ts`) |
| `prebuild` | Cleans the `dist` directory before building |
| `build` | Bundles the server for production via `scripts/build.ts` |
| `start` | Runs the compiled server from `dist/index.js` |
| `db:generate` | Generates Drizzle ORM migration files from schema changes |
| `db:migrate` | Applies pending Drizzle migrations to the database |
| `lint` | Runs ESLint with auto-fix |
| `format` | Formats files with Prettier |
| `typecheck` | Runs `tsc --noEmit` |
| `typecheck:watch` | Runs `tsc --watch --noEmit` |

Database commands can also be run from the root: `bun run db:generate` and `bun run db:migrate`.

## Project structure

```
src/
├── auth/             # Better Auth routes and middleware
├── captcha/          # Captcha generation, validation, and cleanup cron
├── db/
│   ├── migrations/   # Drizzle SQL migrations
│   └── schema/       # Drizzle table definitions
├── emails/           # React Email templates
├── file/             # File upload and storage routes
├── health/           # Health check endpoint
├── lib/              # Shared utilities (db, redis, auth, logger, mq, env)
├── middlewares/      # Hono middleware
├── notification/     # Notification routes and worker
├── app.ts            # Hono app definition and route mounting
├── cron.ts           # Cron job registration
├── index.ts          # Entry point — bootstraps server, workers, and cron
├── server.ts         # HTTP server bootstrap
└── worker.ts         # BullMQ worker bootstrap
```

### API surface

Routers mounted in `src/app.ts`:

- `/health` — health checks
- `/api/auth` — authentication (Better Auth)
- `/api/captcha` — captcha
- `/api/files` — file uploads
- `/api/notifications` — notifications

The `App` type is exported from `src/app.ts` via the package export `@repo/server/app` for use by the client Hono client.

## Database

Schema definitions live in `src/db/schema/`. After changing a schema file:

```bash
bun run db:generate
bun run db:migrate
```

Drizzle Kit is configured in `drizzle.config.ts` and reads `DATABASE_URL` from the environment.

## Production build

```bash
bun run --filter=@repo/server build
bun run --filter=@repo/server start
```

Output is written to `dist/`.

### Docker

Build from the **repository root**:

```bash
docker build \
  -f apps/server/docker/Dockerfile \
  -t vite-fullstack-starter-server \
  .
```

Run with the required environment variables (see above). The container exposes port `3000`.
