# Allocations

A mobile-first savings tracker. You set goals (an amount and a deadline) and pots
(no deadline), log deposits and withdrawals, and the app tells you whether you are
on pace: how much each goal needs this month, how much you have saved toward it,
and what it takes to cover the gap. A smart-split tool divides a paycheck across
your funds, and every change has an Undo.

## Design

The UI is the "Pace v2" design. The interactive prototype lives in
[`docs/design/pace-v2.dc.html`](docs/design/pace-v2.dc.html) and is the source of
truth for visuals and behaviour (its `pace()` / `suggest()` functions are ported in
`src/lib/pace`). The migration plan is in [`docs/redesign-plan.md`](docs/redesign-plan.md);
reference screenshots (dark and light) are in [`docs/screenshots/`](docs/screenshots).

## Stack

- Next.js 16 (App Router, server actions), React 19, TypeScript 5
- Tailwind CSS v4 with design tokens in `src/app/globals.css`
- Auth0 (`@auth0/nextjs-auth0`) for sign-in
- Azure Cosmos DB (`@azure/cosmos`) for storage
- IBM Plex Sans / Mono and Instrument Serif via `next/font`

## Environment variables

Names only; put values in `.env.local`.

| Variable | Used for |
| --- | --- |
| `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET` | Auth0 client |
| `APP_BASE_URL` | Auth0 callback base URL |
| `COSMOS_DB_ENDPOINT`, `COSMOS_DB_KEY` | Cosmos DB account |
| `COSMOS_DB_DATABASE_ID`, `COSMOS_DB_CONTAINER_ID` | Cosmos DB database and container |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint (must be clean) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run selfcheck` | Invariants for the pace maths (see below) |

## Demo mode

`PACE_DEMO=1 npm run dev` runs with in-memory sample data and no Auth0 or Cosmos DB,
which is handy for visual work. It is dev-only: the flag is ignored in production
builds. "Sign out" just returns home in demo mode. Demo state resets when the server
restarts.

## Self-check

`npm run selfcheck` builds the demo data for several "today" dates (month start,
month end, new year, now) and asserts the invariants of `buildPortfolio`, the ring,
the ledger and the smart-split suggestion. Run it after touching `src/lib/pace`.

## Notes

- "Now" is sampled once on the server (`src/app/(app)/layout.tsx`) and passed down, and
  all month boundaries are computed in UTC, so server and client renders agree.
- Preferences (theme, hide balances) are cookies (`pace-theme`, `pace-hide`).

## Folder structure

```
src/
  app/               routes: (app)/ is the signed-in shell (home, funds/[fundId], insights),
                     plus root layout, manifest and icons
  api/               server actions and data access
    funds/ plans/    fund + ledger writes, paycheck splits
    auth/ db/        Auth0 session helpers, Cosmos DB container
    demo/            in-memory demo mode
  components/
    shell/           providers (portfolio, preferences, panels, toasts), bottom nav, panel host
    home/ fund/ insights/   the three screens
    panels/          quick log, smart split, new fund, settings
    ui/              shared primitives (keypad, segmented, toggle, buttons, icons)
  lib/pace/          pure maths and formatting: pace, split, projection, insights, colors
  models/            TypeScript types for funds, transactions, plans, users
scripts/             pace-selfcheck.ts
docs/                redesign plan, design prototype, screenshots
```
