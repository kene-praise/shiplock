# ShipLock — CLAUDE.md

## What this is
ShipLock is a client delivery protection system for dev studios. It answers: "Did they ask for it? Did we build it? Did they approve it? Can they deny it?"

**NOT** a project management tool. Sits on top of existing workflows to lock scope, force acknowledgment, and make silence impossible.

## Stack
- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **Database**: Neon (PostgreSQL) via `@neondatabase/serverless`
- **ORM**: Drizzle
- **Auth**: Better Auth
- **Email**: Resend
- **Background Jobs**: Inngest
- **UI**: shadcn/ui (new-york) + Tailwind CSS
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`)
- **File Storage**: Uploadthing

## Route structure
```
/                                    → Landing / Login
/[org]/projects                      → Project list
/[org]/[project]/dashboard           → Main dashboard
/[org]/[project]/requirements        → Requirements list
/[org]/[project]/requirements/import → AI import wizard
/[org]/[project]/requirements/[id]   → Requirement detail
/[org]/[project]/tasks               → Task list/kanban
/[org]/[project]/tasks/[id]          → Task detail
/[org]/[project]/demos               → Demo video gallery
/[org]/[project]/demos/[id]          → Demo detail
/[org]/[project]/scope-changes       → Scope change log
/[org]/[project]/scope-changes/new   → New scope change
/[org]/[project]/scope-changes/scan  → AI scope drift scanner
/[org]/[project]/scope-changes/[id]  → Scope change detail
/[org]/[project]/standups            → Standup history
/[org]/[project]/standups/today      → Today's standup
/[org]/[project]/blockers            → Blocker log
/[org]/[project]/settings            → Project settings
/[org]/[project]/audit-log           → Full audit trail
/[org]/settings                      → Org settings + team
/review/[signed-token]               → Client review (no auth)
```

## Key users
- **Builder** (owner/builder role): Creates, tracks, sends to client
- **Client** (client role): Reviews via signed URLs — no account required for review pages

## Design system
Ported from the portfolio-app repo (`/Users/kene/projects/portfolio-app`). The living reference is **`/design`** (public route) — every app screen composes from its tokens and components, nothing else.

- **Light-first** with full dark support (`.dark` class via next-themes; `ThemeToggle` in `ui/theme-toggle.tsx`). Page `--bg #f6f6f7`, white `--surface` cards, hairline `--border rgba(0,0,0,0.07)`.
- **Accent**: blue `--accent #2962db` (dark: `#3b7dff`) — the ONLY decorative color. Secondary accent: `--teal`.
- **Status semantics** (StatusBadge tones): approved→`--success`, pending→`--warning`, blocked→`--danger`, auto→`--accent`, disputed→`--disputed` (orange).
- **Components** in `src/components/ui/` (all consume raw tokens via `var(--…)`): `Button` (primary/cta = skeuomorphic blue, framer-motion tap + loading), `Badge`/`StatusBadge`, `Card`+`CardFooter` (gray footer band), `Input`/`Textarea` (built-in label/hint/error), `Tag` (mono pill), `IconBadge`, `Avatar`, `Toggle`, `Separator`, `CodeBlock`, `ThemeToggle`, `SubmitButton` (useFormStatus).
- **Typography**: Geist Sans / Geist Mono (local fonts via `--font-sans`/`--font-mono`). Mono for ref codes (`.ref-code` chip), metrics, timestamps. `tabular-nums` on all dynamic numbers.
- **Radius scale**: `--radius-xs 4px` … `--radius-2xl 24px`; concentric rule: outer = inner + padding.
- **Shadows**: layered transparent `--shadow-sm/md/lg` — adapt to both themes.
- **Legacy aliases**: shadcn names (`--background`, `--card`, `--primary`, `bg-muted`, …) resolve to the new tokens; prefer raw tokens in new code.
- Density: compact — this is a data-heavy tool. Entrances: `.animate-enter` with `--stagger`.

## DB
- Schema in `src/db/schema.ts`
- Connection in `src/db/index.ts`
- Seed script in `src/db/seed.ts` — seeds the Digital Encode GRC project (first real project)
- Migrations in `drizzle/` folder
- Run migrations: `npx drizzle-kit push`
- Run seed: `npx tsx src/db/seed.ts`

## Auth
- Better Auth configured in `src/lib/auth.ts`
- Auth API handler at `src/app/api/auth/[...all]/route.ts`
- Session access via `auth.api.getSession()` in server components

## Inngest jobs
Located in `src/inngest/`:
- `auto-approve-check` — hourly, approves items past 48h deadline
- `weekly-status-email` — Monday 9AM, generates + sends status
- `ping-reminder-24h` — hourly, 24h reminder
- `ping-reminder-48h` — hourly, 48h reminder + auto-approve notice
- `escalation-72h` — hourly, auto-escalates past 72h
- `standup-reminder` — daily 9AM, reminds builders

## /preview route — portfolio showcase

`/preview?section=` is a **separate, standalone route** used exclusively as an iframe embed in Praise's portfolio. It is **not** part of the main ShipLock app UI.

Design direction: light mode, data-dense, inspired by the digitalencodeGRC_web repo (`/Users/kene/Documents/GitHub/digitalencodeGRC_web`).

Key rules for this route:
- **Always light mode** — ignore the app's dark-first tokens. Force light in `globals.css` via `@media (prefers-color-scheme: dark) { :root { ... } }` to survive iframe dark-mode injection.
- **Cards**: `bg-white ring-1 ring-black/[0.06] rounded-xl` — no border, just a shadow ring.
- **Typography**: `font-semibold` max (600 weight). No `font-bold` or `font-black`. Values use `tabular-nums tracking-tight`.
- **Labels**: `text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400`
- **KPI values**: `text-[28px] font-semibold tabular-nums tracking-tight text-gray-900`
- **Charts**: Pure SVG — no recharts. Bar charts + line sparklines + donut rings, all with faint `rgba(0,0,0,0.06)` horizontal grid lines.
- **Sidebar**: `w-[200px] bg-white border-r border-gray-100`, hidden on mobile (`hidden sm:flex`). Active nav item uses a pill background (`rgba(43,127,255,0.09)`), not a left-border indicator.
- **Tone system**: `blue / green / amber / red / gray` — each with a `fg` color and a muted `bg` tint. Used for badges and KPI card icons.
- **Badges**: small colored dot + label text, muted tint background.
- **No portfolio changes until verified locally** — iterate in this repo at `localhost:3000/preview?section=` first.

Sections: `dashboard`, `scope-changes`, `requirements`, `tasks`. All seeded with demo data (Kola POS System). Middleware bypassed for unauthenticated access.

## Decision logger
Silently log meaningful design/product decisions to `.claude/decision_log.md` during every session.

Format:
```
### [TITLE] — YYYY-MM-DD
**What changed:** One sentence.
**Why:** One to two sentences.
**What was considered but not done:** One sentence or "N/A".
**Tags:** [relevant tags]
```

Output when user says: "give me the log" / "session log" / "what did we decide"

## Conventions
- Server Components by default — only `'use client'` when needed (event handlers, hooks, browser APIs)
- All DB queries go in server components or server actions — never in client components
- Ref codes (REQ-001, T-041) always rendered in `font-mono`
- Status badges use `<Badge>` from shadcn with variant overrides
- No hardcoded project checks — everything is dynamic via org/project params
- Seed data is the only "hardcoded" content — runs once against the DB

## Environment variables needed
```
DATABASE_URL=          # Neon connection string
BETTER_AUTH_SECRET=    # Random 32+ char secret
BETTER_AUTH_URL=       # e.g. http://localhost:3000
ANTHROPIC_API_KEY=     # Claude API key
RESEND_API_KEY=        # Resend API key
INNGEST_EVENT_KEY=     # Inngest event key
INNGEST_SIGNING_KEY=   # Inngest signing key
UPLOADTHING_SECRET=    # Uploadthing secret
UPLOADTHING_APP_ID=    # Uploadthing app ID
SIGNED_URL_SECRET=     # Secret for client review signed URLs (use openssl rand -base64 32)
```
