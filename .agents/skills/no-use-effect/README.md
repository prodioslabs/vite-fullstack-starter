# no-use-effect

A Skill that enforces a strict no-direct-`useEffect` rule in React and React Native codebases.

Based on [Factory's approach](https://x.com/alvinsng/status/1900587498498195) and React's official [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) guide.

## Install

```bash
npx skills add alejandrobailo/no-use-effect
```

## The 5 Rules

1. **Derive state, don't sync it** — Compute inline or use `useMemo`
2. **Use data-fetching libraries** — React Query, SWR, etc. instead of fetch-in-effect
3. **Event handlers, not effects** — User actions belong in handlers
4. **`useMountEffect` for mount-time sync** — Named wrapper for `useEffect(..., [])`
5. **Reset with `key`** — Use React's remount semantics instead of reset effects

## What it does

When active, this skill prevents Claude from writing `useEffect` directly in components. Instead, it guides toward the correct primitive for each case: derived state, event handlers, `useMemo`, `useSyncExternalStore`, data-fetching libraries, key-based resets, or `useMountEffect`.
