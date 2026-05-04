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
- Dark-first UI. Background `#09090b`, cards `#18181b`, borders `#27272a`
- Primary: indigo `#6366f1` — professional, trustworthy
- Status colors: green = approved/done, yellow = pending/warning, red = blocked/overdue, blue = auto-approved
- Typography: Inter for UI, mono for ref codes (REQ-001, T-041)
- Radius: `0.75rem` consistent
- Density: compact — this is a data-heavy tool

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
