# @repo/client

React frontend for the vite-fullstack-starter monorepo. Built with Vite, TanStack Router, TanStack Query, Tailwind CSS, and shadcn/ui.

See the [root README](../../README.md) for monorepo setup, infrastructure, and Docker instructions.

## Development

From the repository root:

```bash
bun run --filter=@repo/client dev
```

Or from this directory after installing dependencies at the root:

```bash
bun run dev
```

The dev server runs at [http://localhost:5173](http://localhost:5173) by default.

## Environment variables

Create a `.env` file in this directory (or set variables in your shell):

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the API server (for example `http://localhost:3000`) |

`VITE_*` variables are embedded at build time.

## Scripts

| Script | Description |
| --- | --- |
| `dev` | Starts the Vite development server with HMR |
| `build` | Type-checks with `tsc`, then produces a production build with Vite |
| `preview` | Serves the production build locally for testing |
| `lint` | Runs ESLint with auto-fix |
| `format` | Formats files with Prettier |
| `typecheck` | Runs `tsc --noEmit` |
| `typecheck:watch` | Runs `tsc --watch --noEmit` |

## Project structure

```
src/
├── components/       # UI components (shadcn/ui) and feature components
├── hooks/            # React hooks
├── lib/              # API client, auth, env, and utilities
├── routes/           # TanStack Router file-based routes
├── styles/           # Global CSS
├── app.tsx           # App shell and providers
└── main.tsx          # Entry point
```

### Routing

Routes live under `src/routes/` and are generated into `src/routeTree.gen.ts` by the TanStack Router Vite plugin. Route groups include:

- `_auth/` — login, signup, forgot/reset password
- `_app/` — authenticated app pages (dashboard, projects, notifications)

### API client

The typed Hono client in `src/lib/hono.ts` imports the server `App` type from `@repo/server/app`, giving end-to-end type safety between client and server.

## Production build

```bash
bun run --filter=@repo/client build
```

Output is written to `dist/`.

### Docker

Build from the **repository root**:

```bash
docker build \
  -f apps/client/docker/Dockerfile \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  -t vite-fullstack-starter-client \
  .
```

The image serves the static build on port `80` using static-web-server.
