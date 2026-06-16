# @repo/config

Shared tooling configuration for the vite-fullstack-starter monorepo. Provides base ESLint and Prettier settings consumed by the root, client, and server packages.

See the [root README](../../README.md) for monorepo setup and workspace scripts.

## Contents

| File | Purpose |
| --- | --- |
| `eslint.config.js` | Base ESLint flat config (TypeScript, import ordering, stylistic rules) |
| `prettier.config.js` | Shared Prettier formatting options |
| `base.json` | Shared TypeScript compiler options extended by workspace `tsconfig.json` files |

## Usage

Packages depend on `@repo/config` as a workspace dev dependency and extend its configs locally.

**ESLint** — each package spreads the base config and adds its own rules:

```js
import { default as defaultConfig } from '@repo/config/eslint.config.js'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...defaultConfig,
  // package-specific overrides
])
```

The client adds React and React Hooks plugins on top of this base. The server uses the base config directly.

**Prettier** — packages reference the shared config via their local `prettier.config.js`:

```js
export { default } from '@repo/config/prettier.config.js'
```

**TypeScript** — workspace `tsconfig.json` files extend `packages/config/base.json` for consistent compiler options (`strict`, `ESNext`, `bundler` module resolution, etc.).

## Base ESLint rules

The shared config enforces:

- TypeScript recommended rules via `typescript-eslint`
- Sorted import groups with blank lines between groups
- Single quotes (via `@stylistic/eslint-plugin`)
- No `console` usage
- Object shorthand

## Base Prettier options

| Option | Value |
| --- | --- |
| `semi` | `false` |
| `singleQuote` | `true` |
| `trailingComma` | `'all'` |

## Scripts

| Script | Description |
| --- | --- |
| `lint` | Runs ESLint with auto-fix on this package |
| `format` | Formats files with Prettier |

This package does not define `dev`, `build`, or `typecheck` scripts. Linting and formatting are also run from the root via Turbo (`bun run lint`, `bun run format`).
