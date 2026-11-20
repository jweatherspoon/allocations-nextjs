> **Status: complete.** Phases 0-2 are done and merged to `main`: the app is fully on the Pace v2 design,
> legacy UI and unused dependencies are removed, and end-to-end QA (dark + light, 390x844) passed.
> Reference screenshots are in `docs/screenshots/`. This document is kept as a record.

# Pace v2 redesign — parallel migration plan

Source design: `docs/design/pace-v2.dc.html` (copy of "Concept C v2 - Pace" from the
"Savings tracker app design" canvas). It is a self-contained interactive prototype:
the markup at the top is the visual spec, and the `<script>` at the bottom
(`pace()`, `suggest()`, `renderVals()`) is the behavioural spec. **Match both.**
When this plan and the prototype disagree on visuals, the prototype wins; when they
disagree on interfaces/file ownership, this plan wins.

## Target product (summary of the design)

- **Dark by default**, light mode toggle in Settings. Fonts: IBM Plex Sans (UI),
  IBM Plex Mono (small data labels, keypad), Instrument Serif (all big numbers & titles).
- Two tabs + center action in a bottom bar: **Plan** (home, `/`) · **＋ Log money** · **Insights** (`/insights`).
- **Home**: month header ("November", "NOV 20 · 10 DAYS LEFT") + avatar button → Settings;
  hero card with a **ring split by goal** (arc length = goal's share of this month's need,
  fill = how much of it is covered), "SAVED THIS MONTH $x of $y needed", status line,
  legend chips (tap → fund), **"Cover the gap · $N"** CTA → Smart split pre-filled with each
  goal's shortfall; **Total saved** (serif, tap to hide balances) + composition bar + legend;
  **Goals · by deadline** list (status pill, serif amount, "$X/MO · N MO LEFT", progress bar
  with expected-pace marker); **Pots · no deadline**; archived rows.
- **Fund detail** (`/funds/[fundId]`, no bottom nav): back, Archive/Restore, status,
  serif name, description, big amount "/ target", projection sentence + SVG chart
  (history line + area, dashed projection, target line, TODAY marker), 4 stat tiles
  (Remaining, Months left, Needed / mo, Your pace / mo), History list, sticky
  Deposit / Withdraw buttons (open Quick log).
- **Insights**: "Saved vs. needed" 6-month bars with dashed need line; "Goal timeline · at your pace".
- **Full-screen slide-up panels**: Quick log (Deposit/Withdraw segmented, big serif amount,
  hint "Covers X% of this month's $Y", fund chips, note, keypad, CTA), Smart split
  (step 1 amount keypad → step 2 suggested allocations with sliders, "Fully allocated",
  Re-suggest, Confirm), New fund (Goal/Pot, name, target, deadline month stepper,
  "$X/mo" + context), Settings (Dark mode, Hide balances, Sign out).
- **Toast with Undo** after every mutation (deposit, withdraw, split, create, archive).

## Ground rules for every agent

- Stack: Next.js 16 App Router, React 19, Tailwind v4 (CSS-first `@theme` in `globals.css`), TypeScript strict.
- Gate before merging: `npx tsc --noEmit` clean, `npm run lint` with **0 errors** in files you touched, `npm run build` passes.
- Visual check: run `PACE_DEMO=1 npm run dev` (demo mode, see Phase 0) and screenshot at 390×844
  with Playwright; compare against the prototype. (Chromium is preinstalled; `require('playwright')` works.)
- Accessibility: real `<button>` / `<a href>` / `<input>` + `<label>`; `aria-label` on icon-only buttons; decorative SVG `aria-hidden`.
- Use theme tokens (`bg-surface`, `text-muted`, `border-line`, `font-serif`, …), never raw hex, except fund hues via `fundColor()`.
- Only edit files you own (table below). If you truly need a change in a shared file, keep it minimal and additive, and mention it in your commit message.
- Server actions own persistence; client components never import from `@/api/db/*` directly.
- Delivery: commit on a local branch, then `git fetch origin main && git rebase origin/main`,
  re-run the gate, `git push origin HEAD:main`. If the push is rejected, fetch/rebase/re-gate/push again.

---

## Phase 0 — Foundation (1 agent, sequential, must land first)

Everything Phase 1 builds on. Ship stubs for every Phase 1 file so the app builds and Phase 1
agents only *fill in* files.

### 0.1 Design tokens & fonts
- `src/app/layout.tsx`: load IBM Plex Sans (400/500/600/700), IBM Plex Mono (400/500/600),
  Instrument Serif (400) via `next/font/google` as CSS vars `--font-plex-sans`, `--font-plex-mono`,
  `--font-instrument-serif`. Read cookie `pace-theme` (`'dark' | 'light'`, default `dark`) with
  `cookies()` and set `<html data-theme=…>` server-side (no flash). `<body className="bg-bg text-ink font-sans antialiased">`.
  Add `<meta name="theme-color">` per theme. Title "Allocations".
- `src/app/globals.css`: replace old palette. Define tokens from the prototype exactly:
  `:root, [data-theme="dark"]` → dark values; `[data-theme="light"]` → light values
  (`--bg --surface --hero --ink --muted --line --chip --accent --on-accent --glow --good --warn --neg`).
  `@theme inline` maps them to Tailwind colors (`--color-bg`, `--color-surface`, `--color-ink`, …)
  and fonts (`--font-sans`, `--font-mono`, `--font-serif`). Add `@utility bg-hero { background: var(--hero); }`.
  Hide scrollbars, `-webkit-tap-highlight-color: transparent`, `input[type=range]{accent-color:var(--accent)}`.

### 0.2 Data model & server actions
- `src/models/funds/fund.model.ts`: add optional `hue?: number`.
- `src/api/funds/funds.api.ts` (`'use server'`), add (keep existing exports working):
  ```ts
  type LogEntry = { fundId: string; type: 'deposit' | 'withdrawal'; value: number; notes?: string };
  type TxRef = { fundId: string; transactionId: string };
  logTransactions(entries: LogEntry[]): Promise<{ ok: boolean; refs: TxRef[] }>   // one upsert; updates currentAmount
  voidTransactions(refs: TxRef[]): Promise<boolean>        // status → 'deleted', reverses currentAmount (Undo)
  createFund(input: { name: string; description?: string; targetAmount?: number; targetDate?: string }): Promise<{ ok: boolean; fundId: string }>  // assigns an unused hue
  deleteFund(fundId: string): Promise<boolean>             // Undo of create; needs a removal path in user.api
  setFundStatus(fundId: string, status: 'active' | 'archived'): Promise<boolean>
  ```
  Every mutating action ends with `revalidatePath('/', 'layout')`.
- `src/api/plans/plans.api.ts`: add
  `recordSplit(amount: number, allocations: Record<string, number>): Promise<{ ok: boolean; planId: string; refs: TxRef[] }>`
  — stores a completed `PlanDetails` ("Paycheck split", allocations) and deposits into each fund with note "Paycheck split";
  and `undoSplit(planId: string, refs: TxRef[]): Promise<boolean>` — voids the deposits, marks plan `canceled`.
- **Demo mode** (for local visual QA only): when `process.env.NODE_ENV === 'development' && process.env.PACE_DEMO === '1'`,
  `getUserData`/`upsertUserData`/`getFundDetails`/`getUserPlans`/`getPlanDetails`/`getUserId` use an in-memory store
  (`src/api/demo/demo-store.ts`) seeded with the prototype's `DEFS` data (relative to the real current date), and
  `src/proxy.ts` skips the Auth0 redirect. Must be impossible to enable in production builds. Session user in demo = "Jordan W." (initials JW).

### 0.3 Domain logic — `src/lib/pace/` (pure, no React)
- `format.ts`: `money(n, cents?)` (uses `−` for negatives), `moneyAuto(n)` (= prototype `m2`),
  `formatDayUpper(t)` ("NOV 17, 2026"), `formatMonthYear(t)` ("Mar 2027"), `MONTH_MS`, `DAY_MS`.
- `colors.ts`: `HUES` palette `[160, 25, 255, 330, 85, 210, 120, 290]`, `fundHue(fund)` (fund.hue ?? stable hash of id),
  `fundColor(hue, theme)` → dark `oklch(0.76 0.09 h)`, light `oklch(0.58 0.11 h)`,
  `statusColor(status)` → CSS var string (Behind→`var(--warn)`, Overdue→`var(--neg)`, Funded/Ahead→`var(--good)`, On track→`var(--accent)`).
- `pace.ts`: types + `buildPortfolio(funds: FundDetails[], now = Date.now()): Portfolio`. Port the prototype's
  `pace()` and the derived values in `renderVals()` 1:1. Balance = `fund.currentAmount`; transactions used for time
  series = `status === 'completed'` only, `t = Date.parse(createdAt)`; net = withdrawal ? −v : v.
  A fund is a **goal** iff it has both `targetAmount` and `targetDate`; otherwise a **pot**.
  ```ts
  type PaceStatus = 'On track' | 'Ahead' | 'Behind' | 'Funded' | 'Overdue';
  interface FundPace { left; months; need; recent; pct; expected; status: PaceStatus; end: number; finish: number | null }
  interface TxPoint { id: string; t: number; type: TransactionType; value: number; net: number; notes: string }
  interface FundView { fund: FundDetails; id; name; hue: number; balance: number; isGoal: boolean;
                       pace: FundPace | null; savedThisMonth: number; transactions: TxPoint[] /* newest first */ }
  interface RingSegment { fundId; hue; trackLen; fillLen; offset }   // circumference 2π·100, 5px gaps
  interface Portfolio {
    now; monthStart; daysLeft; monthName;           // "November"
    active: FundView[]; archived: FundView[];
    goals: FundView[];   // active goals sorted by deadline
    pots: FundView[];
    total: number;       // sum of active balances
    needThisMonth: number;
    ring: { segments: RingSegment[]; saved: number; need: number; gap: number; coveredCount: number;
            goalCount: number; gapAllocations: Record<string, number> /* fundId → ceil(shortfall) */ };
    composition: { fundId; name; hue; share: number }[];   // active funds with balance > 0
    defaultQuickFundId: string | null;   // first 'Behind' goal, else first active fund
  }
  ```
- Add a tiny self-check script `scripts/pace-selfcheck.ts` runnable with `npx tsx` (or plain node after tsc) that runs
  `buildPortfolio` on the demo data and asserts a few invariants (no NaN, ring offsets monotonic, statuses valid).

### 0.4 App shell, providers & primitives
- Route group `src/app/(app)/layout.tsx` (server): fetch `getUserFunds()` + session user, render
  `<AppShell funds={…} user={{ name, initials, email }}>{children}</AppShell>`.
- `src/components/shell/app-shell.tsx` (`'use client'`): composes the providers below, the page container
  (`mx-auto w-full max-w-[440px] min-h-dvh`), `<BottomNav/>`, `<PanelHost/>`, `<ToastHost/>`.
- `src/components/shell/portfolio-context.tsx`: `usePortfolio(): Portfolio` (memoized `buildPortfolio` of the funds prop).
- `src/components/shell/preferences-context.tsx`: `usePreferences(): { theme; setTheme(t); hideBalances; toggleHideBalances(); mask(s: string): string }`
  — `mask` returns `'••••'` when hidden. Persist in cookies `pace-theme` / `pace-hide` (1 year), update `document.documentElement.dataset.theme`.
- `src/components/shell/toast-context.tsx`: `useToast(): { show(message: string, undo?: () => void | Promise<void>): void }`
  + `ToastHost` (top, ink background, slides down, 4.2 s, Undo button).
- `src/components/shell/panel-context.tsx`:
  ```ts
  type PanelRequest =
    | { kind: 'quick'; mode?: 'deposit' | 'withdraw'; fundId?: string }
    | { kind: 'split'; amount?: number; allocations?: Record<string, number>; gapMode?: boolean }
    | { kind: 'new' }
    | { kind: 'settings' };
  usePanels(): { open(req: PanelRequest): void; close(): void; current: PanelRequest | null }
  ```
  `PanelHost` renders the full-screen sheet (`fixed inset-0 z-50 bg-bg`, `translateY(100%)→0`,
  `transition .42s cubic-bezier(.2,.85,.25,1)`, unmount content 440 ms after close, focus trap/Escape closes,
  `role="dialog" aria-modal`) and switches on `kind` to the panel components below. Panels receive
  `{ request, onClose }` props.
- `src/components/shell/bottom-nav.tsx`: Plan (`/`) · center ＋ (`aria-label="Log money"`, opens
  `{ kind: 'quick', fundId: portfolio.defaultQuickFundId }`) · Insights (`/insights`). Active = accent, else muted.
  Hidden on `/funds/*`. Respect `env(safe-area-inset-bottom)`.
- `src/components/ui/` primitives (used by several Phase 1 agents):
  `keypad.tsx` (`<Keypad onPress(k)/>`, 3×4 grid 1–9 . 0 ⌫, mono 24px, 54px keys) + `use-amount-input.ts`
  (port prototype `press()`: ≤2 decimals, ≤7 digits; returns `{ raw, value, display, press, setRaw, reset }`),
  `segmented.tsx`, `toggle-switch.tsx`, `panel-header.tsx` (✕ close left, mono/uppercase title center, optional right slot),
  `primary-button.tsx` (58px, radius 18, accent; `disabled` → opacity .35), `chip-button.tsx`, `icons.tsx` (back chevron, plus, close).
- **Stubs** (render a placeholder; Phase 1 owners replace the body, keep the export/props):
  `src/app/(app)/page.tsx` → `<HomeScreen/>` from `src/components/home/home-screen.tsx`;
  `src/app/(app)/funds/[fundId]/page.tsx` → `<FundScreen fundId=…/>` from `src/components/fund/fund-screen.tsx`;
  `src/app/(app)/insights/page.tsx` → `<InsightsScreen/>` from `src/components/insights/insights-screen.tsx`;
  `src/components/panels/{quick-log-panel,smart-split-panel,new-fund-panel,settings-panel}.tsx`.
- **Routing**: delete `src/app/page.tsx` (replaced by the group page), move/replace `src/app/funds/[fundId]`,
  and add permanent `redirects()` in `next.config.ts`: `/funds`→`/`, `/funds/new-fund`→`/`, `/plans`→`/`,
  `/plans/:path*`→`/`, `/analytics`→`/insights`, `/profile`→`/`. Remove those old page/loading files.
  Old components may stay on disk (Phase 2 deletes them) but nothing in `src/app` may import them.

---

## Phase 1 — Features (5 agents in parallel, after Phase 0 is on main)

| Agent | Owns (create/replace) | Must not touch |
|---|---|---|
| **A · Home** | `src/components/home/**`, `src/app/(app)/page.tsx`, `src/app/(app)/loading.tsx` | shell, panels, lib/pace core |
| **B · Fund detail** | `src/components/fund/**`, `src/app/(app)/funds/[fundId]/**`, `src/lib/pace/projection.ts` | shell, panels |
| **C · Insights** | `src/components/insights/**`, `src/app/(app)/insights/**`, `src/lib/pace/insights.ts` | shell, panels |
| **D · Quick log + Smart split** | `src/components/panels/quick-log-panel.tsx`, `src/components/panels/smart-split-panel.tsx`, `src/components/panels/split/**`, `src/lib/pace/split.ts` | other panels |
| **E · New fund + Settings** | `src/components/panels/new-fund-panel.tsx`, `src/components/panels/settings-panel.tsx`, `src/components/panels/new-fund/**` | other panels |

### A · Home
Header (month, mono date line with days left, initials avatar → `open({kind:'settings'})`); hero card (`bg-hero`, radial glow,
228px ring from `portfolio.ring.segments` with track at .2 opacity + animated fill, centre "SAVED THIS MONTH" / serif 56px /
"of $Y needed"); status line (`'Every goal is covered this month'` or `'k of n goals covered'`) + sub
(`'$gap to go · about $x/day for N days'` using `daysLeft`); 2-col legend chips (dot, name, "COVERED"/"$X TO GO") linking to
`/funds/[id]`; "Cover the gap · $N" → `open({kind:'split', amount: sum(gapAllocations), allocations: gapAllocations, gapMode:true})`;
Total saved (HIDE/SHOW toggle + serif number toggles `hideBalances`), composition bar + legend; Goals list rows
(`<Link>` cards), "+ New" → `open({kind:'new'})`; Pots; Archived rows. Empty state when there are no funds
(prompt to create the first goal). All money through `mask()`.

### B · Fund detail
Port the fund-detail section and chart math (put geometry in `src/lib/pace/projection.ts`, 352×170 viewBox scaled to width).
Anchor the history series so its last point equals `balance` (legacy funds may lack an opening transaction).
Archive/Restore → `setFundStatus` + toast with Undo (restores previous status). Deposit/Withdraw →
`open({kind:'quick', mode, fundId})`. Unknown id → `notFound()`. History shows up to 30 latest completed tx
(label = notes || Deposit/Withdrawal, mono date, `−`/`+` amount, withdrawals in `--neg`). "No history yet." empty state.
Also add `loading.tsx` skeleton in tokens.

### C · Insights
Serif "Insights" title; Saved vs. needed card (last 6 months incl. current, bar colours: current = accent,
≥ need = good, else chip; dashed need line; mono month labels); Goal timeline (vertical line, coloured dots,
date, name, verdict "Projected Mar 2027 · 2 mo early" / "… mo late" / "right on time" / "Funded" / "No recent deposits"),
each item links to the fund. Empty states.

### D · Quick log + Smart split
**Quick log**: header (✕, "Split a paycheck →" switches to `{kind:'split'}`), Deposit/Withdraw segmented, serif 80px amount,
hint (over-withdraw in `--neg`: "Only $X in Fund"; else "Covers X% of this month's $Y" / "$Y/mo keeps Fund on pace"),
horizontally scrolling fund chips (selected = accent), note input, keypad, CTA "Deposit $X to Fund" (disabled until valid).
Submit → `logTransactions` → close → toast "Deposited $X to Fund" with Undo → `voidTransactions(refs)`.
**Smart split**: step 1 amount + keypad + "Suggest a split"; step 2 amount, explanation text, "Fully allocated" /
"$X unassigned" / "$X over" + Re-suggest, per-fund rows with range slider (step 5, max = ceil(amount/5)*5) and effect line,
CTA "Confirm split" / "Adjust to $X". Port prototype `suggest()` to `src/lib/pace/split.ts` (pure, unit-checkable).
When opened with `allocations` + `gapMode`, start at step 2 with that allocation and the gap explanation.
Confirm → `recordSplit` → toast "Split $X into N funds" with Undo → `undoSplit`.

### E · New fund + Settings
**New fund**: header "NEW FUND", Goal/Pot segmented (with sub-labels), Name (3–20 chars, serif-less 24px semibold input with label),
Goal-only: Target amount ($ prefix, decimal inputmode), Deadline month stepper (‹ MAR 2027 ›, 1–120 months, default 12),
per-month card ("$X/mo" accent mono + "That's N% of the $Y you've been saving each month."). CTA "Create goal"/"Create pot".
Submit → `createFund` → close → toast "Created Name" with Undo → `deleteFund`.
**Settings**: serif "Settings" title + ✕, card with Dark mode and Hide balances toggles (`usePreferences`), profile line
(name/email), "Sign out" as `<a href="/auth/logout">` in `--neg`.

---

## Phase 2 — Cleanup & QA (1 agent, after all of Phase 1 is on main)

- Delete unused legacy code: `src/components/{funds,plans,navigation,shared}/**`, `src/models/status/**`,
  `src/models/validations/**` and `src/types/validator.ts` if unused, `src/utils/format.utils.ts` if unused,
  `NAVBAR_IMPLEMENTATION.md`, `REACT_HOOK_FORM_IMPLEMENTATION.md`, default Next svgs in `public/` that are unused.
- Remove unused deps (`chart.js`, `react-chartjs-2`, `swiper`, `react-hook-form` if unused) and update the lockfile.
- `npm run lint` → 0 errors, 0 warnings; `tsc` clean; `build` passes.
- End-to-end QA in demo mode with Playwright at 390×844, dark + light: home, fund (goal + pot + archived), insights,
  each panel, each toast + Undo, hide balances, redirects of old routes. Fix any integration bugs found.
- Update `README.md` (what the app is, design source, demo mode, scripts) and update `manifest.json`
  `theme_color`/`background_color` to the dark tokens.
