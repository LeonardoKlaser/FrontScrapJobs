# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

FrontScrapJobs — React 19 + TypeScript + Vite 7 SPA for ScrapJobs. Ships as a Nginx-served static bundle (`Dockerfile` + `nginx.conf`). The backend lives in a sibling repo `../ScrapJobs` (Go, `:8080`); `VITE_API_URL` points at it and auth is a backend-issued HttpOnly cookie — the frontend never handles tokens directly.

Portuguese (pt-BR) is the primary locale; English strings exist. When adding copy, add keys to both locales.

## Commands

```bash
npm run dev            # vite on :5173
npm run build          # tsc -b && vite build (typecheck is part of build)
npm run lint           # eslint — CI runs this; prettier is wired in via eslint-plugin-prettier
npm run lint:fix       # also formats
npm run test           # vitest run (jsdom)
npm run test:watch
npx vitest run path/to/file.test.tsx           # single unit test file
npx playwright test                             # e2e (auto-starts `npm run dev` on :5173)
npx playwright test e2e/auth.spec.ts            # single e2e
npm run storybook                               # :6006
ANALYZE=1 npm run build:analyze                 # rollup bundle visualizer → dist/stats.html
```

Path alias `@/` → `src/` (configured in `vite.config.ts`, `components.json`, and all four tsconfigs).

## Architecture

### Boot sequence

`src/main.tsx` → wraps `<App>` in `QueryClientProvider`. `App.tsx` builds the router with `createRouter(queryClient)` and wraps `<RouterProvider>` in `ThemeProvider` → `TooltipProvider` → `ErrorBoundary` → i18n `Suspense` → `Toaster`. The router is memoized on `queryClient` — don't recreate it on every render.

### Routing (`src/router/`)

Data router via `createBrowserRouter(queryClient)` in `routes.tsx`. **Every page is `lazy()`-imported** — preserve this when adding pages. Two layouts:

- `PublicLayout` — landing, auth, terms, privacy, checkout, payment-confirmation.
- `MainLayout` (prefix `/app`) — everything behind auth; uses `authLoader(queryClient)` which calls `queryClient.fetchQuery(['user'])` and redirects to `/login` on 401.

`guestLoader` guards login/forgot/reset so an authed user can't see them.
`AdminGuard` wraps `/app/admin-dashboard` and `/app/add-new-site` — checks `user.is_admin` after auth.
`shouldRevalidate` on the app route skips the `me` refetch when only the pathname changes without leaving `/app`.

**All routes are centralized in `src/router/paths.ts` — never hardcode route strings; use `PATHS.app.x`.**

### Data layer (`src/services/` + `src/hooks/`)

- `src/services/api.ts` — the one `axios` instance. `baseURL: VITE_API_URL || 'http://localhost:8080'`, `withCredentials: true`. **A global 401 interceptor redirects to `/login?from=<path>` unless:**
  - the request URL is `/api/me` (authLoader handles that explicitly), or
  - the current path is in `publicPaths` (`/`, `/login`, `/forgot-password`, `/reset-password`, `/terms`, `/privacy`) or starts with `/checkout/` or is `/payment-confirmation`.
  - **When adding a new public page, update `publicPaths` in `api.ts` or it will redirect-loop.**
- 403 with `error: "subscription_expired"` → redirects to `/app/renew`.
- `isRedirecting` guard prevents concurrent redirects from firing multiple times.

Service files (`authService.ts`, `curriculumService.ts`, …) expose plain async functions and are the only code that imports `api`. Hooks in `src/hooks/` (`useAuth`, `useDashboard`, …) wrap services with `useQuery`/`useMutation` and own the query keys. **Components must not call `api` or services directly — go through a hook.**

### Forms

`react-hook-form` + `@hookform/resolvers/zod`. Schemas in `src/validators/` are the source of truth for shapes; infer types with `z.infer<typeof schema>`.

### UI layer

- shadcn/ui, style `new-york`, base color `neutral`, generated into `src/components/ui/` (aliases in `components.json`).
- Icons: `lucide-react`.
- Tailwind v4 via `@tailwindcss/vite` — **there is no `tailwind.config.js`**. Design tokens live in `src/index.css` using `@theme`. `tw-animate-css` for animations.
- Non-primitive components are grouped by feature in `src/components/{accountPage,adminDashboard,analysis,applications,checkout,curriculum,forms,landingPage,sites,common}/`.
- Every primitive in `src/components/ui/` has a `.stories.tsx` — add one when introducing a new primitive.
- Toasts use `sonner`; `ThemedToaster` in `App.tsx` syncs theme from `ThemeProvider`.

### Bundling

Vite manual chunks in `vite.config.ts` split vendor bundles: `vendor-react / router / query / ui / form / axios`. **Keep this list in sync when adding large deps** or they'll end up in the main chunk.

### i18n

`react-i18next` initialized in `src/i18n/`. Default is pt-BR. Route strings that need translation go through `i18n.t()` (e.g. loader fallbacks in `routes.tsx`).

### Auth-adjacent patterns

- `useUser()` is the canonical hook for the current user; it wraps the same `['user']` query the loader primes.
- `history.scrollRestoration = 'manual'` is set in `main.tsx` so the router controls scroll.

## Testing

- **Unit**: Vitest + Testing Library, jsdom env, setup in `src/test/setup.ts`. `axios-mock-adapter` for service tests. Vitest `exclude: ['e2e/**', 'node_modules/**']` — don't put unit tests under `e2e/`.
- **E2E**: Playwright in `e2e/`, `baseURL: http://localhost:5173`, `reuseExistingServer: true` (so `npm run dev` running in another terminal speeds up local runs). Chromium only.
- **Storybook 10** with `@storybook/addon-vitest` — stories can be run as component tests.

## Coding conventions (enforced by ESLint + Prettier)

- No semicolons, single quotes, no trailing commas, LF line endings, max line 100, no trailing whitespace, one blank line max, `eol-last` required.
- `@typescript-eslint/no-unused-vars` as warn; `args: 'none'`, `ignoreRestSiblings: true`.
- `no-console` is **off** intentionally — logging to console is OK.
- `npm run lint:fix` formats via prettier plugin.

Four tsconfigs — pick the right one when adding files:
- `tsconfig.app.json` — everything under `src/`.
- `tsconfig.node.json` — `vite.config.ts`, tooling.
- `tsconfig.test.json` — vitest.
- `tsconfig.e2e.json` — playwright specs.

## Production deploy (Nginx CSP)

`nginx.conf` serves `dist/` with a strict CSP. `connect-src` currently allows `*.scrapjobs.com.br`, `*.pagar.me`, Google Analytics/Tag Manager, Google Ads, Meta Pixel, and a specific S3 bucket. `script-src` mirrors the same list.

**When integrating a new third-party script or API, add its domain to both `script-src` and `connect-src` in `nginx.conf`** — otherwise it'll work in dev but silently fail in prod. `/stats.html` is denied (don't expose bundle analyzer in prod).
