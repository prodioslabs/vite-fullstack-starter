# vite-fullstack-starter

A fullstack monorepo starter using **Vite**, **React**, **TanStack Router**, and **Hono**. The client and server are separate workspace packages orchestrated with **Turborepo** and **Bun**.

## Tech stack

| Layer   | Technologies                                                             |
| ------- | ------------------------------------------------------------------------ |
| Client  | React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS, shadcn/ui |
| Server  | Bun, Hono, Drizzle ORM, Better Auth, BullMQ, Redis, MinIO                |
| Tooling | TypeScript, ESLint, Prettier, Turbo                                      |

## Project structure

```
.
├── apps/
│   ├── client/          # Vite + React frontend (@repo/client) — see [apps/client/README.md](apps/client/README.md)
│   └── server/          # Hono API, workers, and cron jobs (@repo/server) — see [apps/server/README.md](apps/server/README.md)
├── packages/
│   └── config/          # Shared ESLint and Prettier config (@repo/config) — see [packages/config/README.md](packages/config/README.md)
├── docker/              # Docker Compose for local infrastructure
└── scripts/             # Root-level utility scripts
```

## Prerequisites

- [Bun](https://bun.sh) 1.3.11 (see `packageManager` in root `package.json`)
- PostgreSQL database
- Optional local services via Docker Compose: Redis, MinIO, Loki, Grafana, Browserless

## Getting started

```bash
# Install dependencies
bun install

# Configure environment variables
cp apps/client/.env.example apps/client/.env
cp apps/server/.env.example apps/server/.env

# Start infrastructure (Redis, MinIO, etc.)
docker compose -f docker/docker-compose.yaml up -d

# Run database migrations
bun run db:migrate

# Start client and server in development mode
bun run dev
```

The client runs at [http://localhost:5173](http://localhost:5173) by default. The server listens on port `3000`.

Copy the `.env.example` files and adjust values for your local setup. The server example includes defaults that match `docker/docker-compose.yaml` (Redis on `6379`, MinIO on `9000`).

### Environment variables

Example files live at `apps/client/.env.example` and `apps/server/.env.example`. See the package READMEs for full details:

- [Client environment variables](apps/client/README.md#environment-variables)
- [Server environment variables](apps/server/README.md#environment-variables)
- [Server runtime subsystems](apps/server/README.md#runtime-subsystems) — `ENABLE_HTTP_SERVER`, `ENABLE_QUEUE_WORKERS`, `ENABLE_CRON`

**Client** (`apps/client`):

| Variable            | Description                                         |
| ------------------- | --------------------------------------------------- |
| `VITE_API_BASE_URL` | Base URL of the API server (embedded at build time) |

**Server** (`apps/server`):

| Variable                                            | Description                                                          |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`                                      | PostgreSQL connection string (`postgresql://…`)                      |
| `HEALTHCHECK_API_KEY`                               | API key for health checks (min. 32 characters)                       |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY`                   | MinIO / S3 credentials                                               |
| `CORS_ORIGIN`                                       | Allowed CORS origin (default: `http://localhost:5173`)               |
| `BETTER_AUTH_URL`                                   | Auth server URL (default: `http://localhost:3000`)                   |
| `APP_BASE_URL`                                      | Frontend URL for emails and links (default: `http://localhost:5173`) |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB`              | Redis connection settings                                            |
| `S3_ENDPOINT`, `S3_PORT`, `S3_USE_SSL`, `S3_BUCKET` | Object storage settings                                              |
| `ENABLE_HTTP_SERVER`                                | Enable the HTTP API server (default: `true`)                         |
| `ENABLE_QUEUE_WORKERS`                              | Enable BullMQ background workers (default: `true`)                   |
| `ENABLE_CRON`                                       | Enable scheduled cron jobs (default: `true`)                         |
| `NODE_ENV`, `PORT`                                  | Runtime mode and HTTP port (default: `3000`)                         |
| `LOKI_HOST`, `LOKI_USERNAME`, `LOKI_PASSWORD`       | Optional log shipping to Grafana Loki                                |
| `SMTP_USER`, `SMTP_PASSWORD`                        | Optional email delivery                                              |

## Scripts

Scripts are defined per package and orchestrated from the root. Run any script from the repo root with `bun run <script>`, or from a specific package with `bun run --filter=<package> <script>`.

### Root (`package.json`)

| Script             | Description                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `dev`              | Starts all packages in dev mode via Turbo (client Vite server + server with watch)         |
| `build`            | Builds all packages via Turbo (`server` must build before dependents)                      |
| `clean`            | Removes `node_modules` and `dist` directories across the monorepo                          |
| `lint`             | Runs root ESLint and workspace lint in parallel                                            |
| `lint:root`        | Lints root-level `*.{ts,js}` and `scripts/**/*.{ts,js}`                                    |
| `lint:workspace`   | Runs `lint` in every workspace package via Turbo                                           |
| `format`           | Runs root Prettier and workspace format in parallel                                        |
| `format:root`      | Formats root-level `*.{ts,js,json,md}` and `scripts/**/*`                                  |
| `format:workspace` | Runs `format` in every workspace package via Turbo                                         |
| `typecheck`        | Type-checks all packages via Turbo                                                         |
| `typecheck:watch`  | Runs `typecheck:watch` in all packages via Turbo                                           |
| `match-versions`   | Syncs dependency versions across workspaces (`prematch-versions` runs `bun install` first) |
| `db:generate`      | Generates Drizzle migrations in `@repo/server`                                             |
| `db:migrate`       | Applies Drizzle migrations in `@repo/server`                                               |
| `db:seed`          | Forwards to `@repo/server` (script not yet defined in the server package)                  |

### Client — `@repo/client` (`apps/client/package.json`)

| Script            | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `dev`             | Starts the Vite development server with HMR                        |
| `build`           | Type-checks with `tsc`, then produces a production build with Vite |
| `preview`         | Serves the production build locally for testing                    |
| `lint`            | Runs ESLint with auto-fix on the client source                     |
| `format`          | Formats client files with Prettier                                 |
| `typecheck`       | Runs `tsc --noEmit` to verify types without emitting files         |
| `typecheck:watch` | Runs `tsc --watch --noEmit` for continuous type checking           |

### Server — `@repo/server` (`apps/server/package.json`)

| Script            | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `dev`             | Starts the server with Bun in watch mode (`src/index.ts`)  |
| `prebuild`        | Cleans the `dist` directory before building                |
| `build`           | Bundles the server for production via `scripts/build.ts`   |
| `start`           | Runs the compiled server from `dist/index.js`              |
| `db:generate`     | Generates Drizzle ORM migration files from schema changes  |
| `db:migrate`      | Applies pending Drizzle migrations to the database         |
| `lint`            | Runs ESLint with auto-fix on the server source             |
| `format`          | Formats server files with Prettier                         |
| `typecheck`       | Runs `tsc --noEmit` to verify types without emitting files |
| `typecheck:watch` | Runs `tsc --watch --noEmit` for continuous type checking   |

### Config — `@repo/config` (`packages/config/package.json`)

Shared tooling package. It does not expose `dev`, `build`, or `typecheck` scripts — it provides ESLint and Prettier configuration consumed by other packages.

| Script   | Description                                     |
| -------- | ----------------------------------------------- |
| `lint`   | Runs ESLint with auto-fix on the config package |
| `format` | Formats config files with Prettier              |

## Running scripts in a single package

```bash
# Client only
bun run --filter=@repo/client dev

# Server only
bun run --filter=@repo/server dev

# Production server
bun run --filter=@repo/server build
bun run --filter=@repo/server start
```

## Docker

Each app has a production Dockerfile under `apps/client/docker/` and `apps/server/docker/`. Both images must be built from the **repository root** so the monorepo context (workspaces, lockfile, and shared packages) is available.

### Build images

Run these commands from the project root:

```bash
# Client — static SPA served on port 80
docker build \
  -f apps/client/docker/Dockerfile \
  --build-arg VITE_API_BASE_URL=http://localhost:3000 \
  -t vite-fullstack-starter-client \
  .

# Server — Bun API on port 3000
docker build \
  -f apps/server/docker/Dockerfile \
  -t vite-fullstack-starter-server \
  .
```

`VITE_API_BASE_URL` is baked into the client bundle at build time. Set it to the URL where the API will be reachable from the browser (for example `https://api.example.com` in production).

### Run containers

The server image expects runtime environment variables (see [Environment variables](#environment-variables) above). Pass them with `-e` flags or an env file:

```bash
docker run --rm -p 3000:3000 \
  --env-file apps/server/.env \
  vite-fullstack-starter-server
```

Or pass variables individually:

```bash
docker run --rm -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e HEALTHCHECK_API_KEY=your-secret-key-at-least-32-chars \
  -e S3_ACCESS_KEY=minioadmin \
  -e S3_SECRET_KEY=minioadmin \
  vite-fullstack-starter-server
```

To run API-only, worker-only, or cron-only containers, set the `ENABLE_*` flags — see [Server runtime subsystems](apps/server/README.md#runtime-subsystems).

```bash
docker run --rm -p 8080:80 vite-fullstack-starter-client
```

The client container serves the built SPA with [static-web-server](https://github.com/static-web-server/static-web-server) and exposes port `80`. Map it to any host port as needed (for example `-p 8080:80`).

### Image overview

| Image  | Dockerfile                      | Default port | Notes                                                                                                                                        |
| ------ | ------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Client | `apps/client/docker/Dockerfile` | `80`         | Multi-stage: Bun installs deps and runs `bun run build --filter @repo/client`, then copies `apps/client/dist` into a static-web-server image |
| Server | `apps/server/docker/Dockerfile` | `3000`       | Multi-stage: Bun builds `@repo/server`, then runs `dist/index.js`; `sharp` is reinstalled in the final stage as a native dependency          |

### Local infrastructure

`docker/docker-compose.yaml` is separate from the app images. Use it to run supporting services locally (Redis, MinIO, Loki, Grafana, Browserless):

```bash
docker compose -f docker/docker-compose.yaml up -d
```
