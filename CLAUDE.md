# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Мозаика Здоровья" (Mosaic Health) — a PWA for a restorative-medicine / kinesiotherapy clinic. UI text is in Russian. **The owner is non-technical** — explain in plain language, see memory.

**Monorepo** (the repo root was reorganized from a single Vite app):
- **`frontend/`** — React 19 + Vite SPA (the original prototype, design approved).
- **`backend/`** — NestJS + Prisma + PostgreSQL API ("the engine"). Added to turn the prototype into a real product.
- **`docker-compose.yml`** — Postgres + MinIO for prod/CI. On the dev machine these run via Homebrew instead (Docker not installed).

A backend migration is in progress (plan: `~/.claude/plans/keen-imagining-peacock.md`). Backend Phases 1–7 are done & tested (auth+roles, profile/settings/catalog/history, S3 media with signed URLs, individual programs + specialist panel, articles/podcasts, shop/orders). Phase 8 (rewiring the frontend to the API: react-query, auth context, real video/audio players, removing localStorage) is the remaining work — the frontend still runs standalone on localStorage until then.

## Backend (`backend/`)

NestJS + Prisma + PostgreSQL, API under `/api`, runs on **port 4000**. Auth = email+password, JWT access token (Bearer header) + refresh token (httpOnly cookie). Three roles: `PATIENT` / `SPECIALIST` (doctor) / `ADMIN`, enforced by global `JwtAuthGuard` + `RolesGuard` (`@Public()`, `@Roles()`, `@CurrentUser()` decorators in `src/auth/`). Media (video/audio/avatars) lives in S3/MinIO; backend issues short-lived presigned URLs via `GET /api/media/sign` with access control (individual-program videos only for the assigned patient).

```bash
cd backend
npm run start:dev        # dev server with watch (http://localhost:4000/api)
npm run build            # compile to dist/
npm run prisma:migrate   # create/apply a migration after editing prisma/schema.prisma
npm run db:seed          # load catalog/products/articles + demo accounts
npm run prisma:studio    # browse the DB
```
Local infra: `brew services start postgresql@16`; MinIO: `minio server "$HOME/.mosaic-minio/data" --address :9000 --console-address :9001`. Demo accounts (password `Demo12345`): admin@/doctor@/patient@mosaic.health.

## Frontend (`frontend/`)

```bash
cd frontend
npm run dev       # Vite dev server with HMR (http://localhost:5173)
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run lint      # ESLint over the repo
```

There is no test suite or test framework configured.

## Architecture

- **React 19 + Vite 8**, plain JavaScript (`.jsx`, no TypeScript — `jsconfig.json` only provides the `@/*` → `src/*` path alias).
- **`src/App.jsx` is the single source of truth.** It holds *all* global state (`currentScreen`, `user`, `history`, `settings`, `cart`, `isLoggedIn`) and passes data + handlers down to screens via props. There is no Context, router, or state library.
- **Navigation is a manual screen switcher**, not a router. `currentScreen` is a string; `renderScreen()` is a `switch` that mounts one screen component. Every screen receives `onNavigate={setCurrentScreen}` and calls it with the next screen's string id to move. When adding a screen: add its `case` in `renderScreen()`, import it, and wire any state it needs.
- **App shell** in `App.jsx` renders a fixed header (logo + RU/EN lang toggle + notification bell) and conditionally a `BottomNav` (only on `home` and `profile`). Screen content scrolls inside `<main>`.
- **Persistence**: auth/onboarding state is mirrored to `localStorage` (`isLoggedIn`, `user`, `consentDate`). On boot, `App` decides the initial screen: not-logged-in → `onboarding-video`; logged-in → `home`, but re-shows `onboarding-consent` if the stored consent is older than 90 days. `user`, `cart`, `history`, and `settings` otherwise reset on reload.
- **Mock data** lives in `src/data/mockData.js` (initial history, settings, achievements). Product/catalog data is currently defined inline within screen components.

### Screen flow
`onboarding-video` → `onboarding-consent` (90-day disclaimer) → `login`/`register` → `home`. From `home`/`profile` (bottom nav) users reach `health-helpers`, `creator-materials`, and the shop funnel `shop` → `cart` → `checkout`.

## Styling

- **Despite Tailwind v4 being installed, styling is overwhelmingly custom.** `src/index.css` (~1600 lines) defines BEM-style classes (e.g. `bento-grid__item`, `header-premium`) and CSS variables (`--color-bg`, etc.); components use these class names plus heavy **inline `style={{}}`** objects. Tailwind utilities and the `@theme`/`shadcn`-style tokens at the bottom of `index.css` exist but are largely unused.
- When changing components, match the existing approach (custom classes + inline styles), not greenfield Tailwind. `cn()` in `src/lib/utils.js` (clsx + tailwind-merge) is available but rarely needed.
- Follow `.ai-rules`: keep spacing/whitespace consistent with existing buttons/cards, prioritize clean open space, and don't cram text into containers. Mobile-first — the final target is an installable PWA.

## Conventions / gotchas

- **Russian-language codebase**: comments, UI strings, and commit context are in Russian. Match this.
- **Ignore dead artifacts.** The repo contains leftover prototype files — `Мозаика Здоровья 2.html`, `backup_headers/`, and references to removed tooling (shadcn, `components.json`, old HTML prototypes). Per `.ai-rules`, do **not** try to restore, recreate, or search by them. Work only with the active Vite build under `src/`.
- `HomeScreen.jsx` (~2400 lines) and `ProfileScreen.jsx` (~850 lines) are the largest, most feature-dense screens.
