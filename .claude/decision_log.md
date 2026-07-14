# ShipLock — Decision Log

---

### UI RE-PIVOT TO MINIMAX AGENT STYLE — 2026-06-02
**What changed:** Superseded the Notion theme (same day) with the MiniMax Agent look from agent.minimax.io: pure white content, soft-grey sidebar (#f7f7f8) where the active nav item is a white pill with hairline border + soft shadow, near-black text (#1a1a1a), light borders (#ebebeb), black pill buttons, 10px radius, blue accent (#2b7fff), soft diffuse shadows (.shadow-soft/.shadow-pop/.shadow-btn). Sidebar restructured with logo+collapse header, workspace selector, main nav, a "More" group label, and footer; buttons enlarged to h-9 for comfortable padding.
**Why:** Kene prefers MiniMax's colours, shadows, radius, spacing, sidebar and buttons; asked for a 1:1 replication of that visual language.
**What was considered but not done:** Initially made the sidebar white with grey active pill — corrected to grey sidebar + white active pill per Kene's screenshot. Live-site CSS couldn't be scraped (JS SPA), so values were extracted from provided screenshots. Per-page filter pills/search not yet converted to fully-rounded MiniMax style (deferred).
**Tags:** [ui, design-system, minimax, theme, sidebar, buttons]

### UI PIVOT TO NOTION-STYLE LIGHT THEME — 2026-06-02
**What changed:** Replaced the dark-first design system with a Notion-inspired light-only theme — warm-white surfaces (#fff / #f7f6f3 sidebar), warm near-black text (#37352f), hairline borders (#e9e9e7), small dark buttons (primary = #37352f), 4px radius, Inter font. Re-skinned all status colors and remapped ~100 dark Tailwind utilities (e.g. text-*-400 → -600, bg-*-950 → -50) across 17 page files.
**Why:** Kene wants a clean, professional Notion 1:1 feel. Token-driven swap (globals.css + tailwind + button) reskins shadcn components centrally; the per-page remap fixes hardcoded dark badge/status classes.
**What was considered but not done:** Keeping a dark mode (chose light-only); mapping to Notion's exact muted hex palette per status (used contrast-correct Tailwind shades instead for maintainability); tightening every rounded-xl to 4px (deferred — cosmetic).
**Tags:** [ui, design-system, notion, theme, tailwind]

### CLIENT IDENTITY VIA PER-RECIPIENT TOKENS — 2026-05-04
**What changed:** Each client team member gets their own signed token with their email embedded, instead of one shared link.
**Why:** Ensures sign-off is tied to the specific email that received the link. Identity proof comes from the token, not from what the user types — making approvals legally traceable.
**What was considered but not done:** OTP email verification per sign-off (adds friction for large teams, token-per-recipient is sufficient for V1).
**Tags:** [auth, review-flow, security, client-identity]

---

### CLIENT_REVIEWS TABLE FOR MULTI-REVIEWER SIGN-OFFS — 2026-05-04
**What changed:** Added `client_reviews` table to record individual sign-offs (reviewerName, reviewerEmail, decision, comment, scopeCreepDetected, scopeCreepSummary, timestamps).
**Why:** Multiple client team members need to independently approve. The previous schema stored one `clientApprovedBy` per requirement (FK to users), which didn't work for anonymous reviewers or team review.
**What was considered but not done:** Requiring a minimum quorum of approvals before marking a requirement approved — deferred to V2.
**Tags:** [schema, review-flow, multi-reviewer]

---

### SCOPE CREEP AUTO-DETECTION ON REJECTION — 2026-05-04
**What changed:** When a client rejects/disputes with a comment, Claude Haiku classifies the comment to detect new scope. If detected, a draft scope change is auto-created.
**Why:** The rejection comment is the most likely place scope creep enters. Catching it automatically and creating a paper trail is the core value prop of ShipLock.
**What was considered but not done:** Blocking the rejection flow until scope change is acknowledged — too heavy for V1, passive detection is sufficient.
**Tags:** [ai, scope-creep, claude, review-flow]

---

### DEMO REVIEW PAGE SHOWS VIDEO + REQUIREMENT + TASKS — 2026-05-04
**What changed:** Demo review page now shows: video (prominent, click-to-open), linked requirement (refCode + title + description), all linked tasks with status, team sign-off list, name capture.
**Why:** Client needs full context to approve — just the video isn't enough. They need to see what requirement the demo is satisfying and what work was done.
**What was considered but not done:** Embedded video player (iframe) — kept as external link because video URLs could be Loom, YouTube, etc. with varying embed support.
**Tags:** [review-flow, demo, ui]

---

### REVIEW FLOW SPLIT: REQUIREMENTS AT START, DEMOS AT END — 2026-05-04
**What changed:** Clarified the two review moments: requirement review happens at project start (client confirms scope), demo review happens at delivery (client confirms work).
**Why:** These are fundamentally different moments with different contexts. The page content reflects this — req review is about what was promised, demo review is about what was built.
**What was considered but not done:** N/A
**Tags:** [product, review-flow, architecture]

---

### BUILDER EMAIL NOTIFICATION ON CLIENT RESPONSE — 2026-05-04
**What changed:** When any client responds (approve or reject), all builder/owner users in the org get an email notification with who responded, what they decided, their comment, and a scope creep flag if relevant.
**Why:** Builder had no way to know when clients responded without polling the dashboard. Silent responses were a gap.
**What was considered but not done:** In-app notifications/badge — email is sufficient for V1.
**Tags:** [notifications, email, review-flow]

---

### LOGIN: SIGN-IN ONLY, NO SIGNUP — 2026-05-04
**What changed:** Removed signup/create account from the login page. Login is email + password only.
**Why:** ShipLock is a studio tool — access is provisioned, not self-serve. Open signup would let anyone create an account.
**What was considered but not done:** Invite-based signup flow — deferred, accounts are created manually for now.
**Tags:** [auth, product]

---

### LOGIN PAGE USES DIRECT FETCH INSTEAD OF BETTER-AUTH CLIENT — 2026-05-04
**What changed:** Login page replaced `signIn.email` from `better-auth/react` with a plain `fetch("/api/auth/sign-in/email")`.
**Why:** The `better-auth/react` import was causing a React hydration failure (event handlers not attaching), making both the eye toggle and login button non-functional. Direct fetch to the same endpoint avoids the import issue entirely.
**What was considered but not done:** Debugging the root cause in the better-auth/react module — direct fetch is simpler and more reliable.
**Tags:** [auth, bug-fix, hydration]

---

### TRUSTED ORIGINS FLEXIBLE FOR DEV PORTS — 2026-05-04
**What changed:** `trustedOrigins` in `auth.ts` now includes localhost:3000, 3001, and 3002 in development instead of just one hardcoded URL.
**Why:** Next.js dev server picks a port dynamically. If it's not 3000 (port already in use), Better Auth was rejecting all sign-in attempts with "Invalid origin".
**What was considered but not done:** Reading the port from an env var — multi-port allow-list is simpler for local dev.
**Tags:** [auth, dev-experience, bug-fix]

---

### CLIENT TEST EMAIL SET TO praiseofumaduadike@gmail.com — 2026-05-04
**What changed:** Client user `user_client_grc` email updated from `client@digitalencode.com` to `praiseofumaduadike@gmail.com` in both DB and seed.
**Why:** Testing the review email flow requires a real inbox. The old address was a placeholder.
**What was considered but not done:** N/A
**Tags:** [testing, seed, email]

---

### DEV EMAIL ROUTING VIA RESEND TEST ADDRESS — 2026-05-04
**What changed:** In development, all emails are sent from `onboarding@resend.dev` and routed to `praizzze4@gmail.com` regardless of the intended recipient.
**Why:** Resend's free tier only allows sending to verified addresses. The `sendEmailPayload` wrapper handles this transparently.
**What was considered but not done:** N/A
**Tags:** [email, dev-experience, resend]

---

### TWO BUILDER ACCOUNTS CREATED — 2026-05-04
**What changed:** Created two Better Auth accounts: `divverse@shiplock.dev` (ShipLock#2025!) and `kene@shiplock.dev` (Studio#Lock99). Both land on `/digitalencode/projects` after login.
**Why:** No auth accounts existed in the DB despite seed users existing in the app `users` table. Better Auth uses separate `auth_users` / `auth_accounts` tables.
**What was considered but not done:** N/A
**Tags:** [auth, accounts, setup]

### Per-user org routing + signup/onboarding — 2026-07-09
**What changed:** Removed hardcoded `/digitalencode/projects` redirects (root page + login); root now resolves the signed-in user's org by email and redirects there. Added `/signup` (Better Auth sign-up/email) and `/onboarding` (creates own org via `createOrgForCurrentUser`, user becomes `owner`).
**Why:** All users were being funneled into the Digital Encode org regardless of identity; new users had no way to sign up or start their own workspace.
**What was considered but not done:** Creating a first project during onboarding — deferred to the existing empty-state "New Project" flow; org-level access control in middleware (any session can still open any org slug).
**Tags:** [auth, onboarding, routing, multi-tenancy]

### Org membership gate — 2026-07-09
**What changed:** New `(app)/[org]/layout.tsx` verifies the signed-in user belongs to the org in the URL (users↔organizations join by email + slug); non-members are redirected to `/` which resolves to their own org.
**Why:** Middleware only checked that a session cookie existed, so any logged-in user could open any org's URLs.
**What was considered but not done:** Enforcing in middleware — skipped since it would need a DB round-trip per request; a server-component layout gate covers all org routes in one place. Server actions still trust their orgId/projectId args and could be hardened later.
**Tags:** [auth, security, multi-tenancy]

### Server-action authorization hardening — 2026-07-09
**What changed:** New `src/lib/actions/guard.ts` (`requireBuilder(orgSlug)` + `requireProjectInOrg`) applied to every session-based mutating action across projects, orgs, demos, requirements, tasks, scope-changes, dod, and standups. Client-supplied `orgId`/`projectId`/resource IDs are now verified against the caller's org before any write. Also: task `ownerId` and standup `userId` now come from the authenticated user (were hardcoded `"user_kene"`); audit logs record the app users.id (FK-correct) instead of the Better Auth id; project-slug lookups in send-to-client flows are org-scoped.
**Why:** Actions previously trusted whatever IDs the client sent — any logged-in user could mutate any org's data by invoking actions directly.
**What was considered but not done:** Role granularity beyond excluding `client` (e.g. owner-only org settings) — deferred; review.ts left token-gated as designed.
**Tags:** [auth, security, server-actions, multi-tenancy]

### Double-submit fix on create forms — 2026-07-09
**What changed:** New `<SubmitButton>` (useFormStatus, disables while pending) swapped into all row-creating forms (projects/new, requirements/new, tasks/new, demos/new, scope-changes/new, standups/today, onboarding). `createProject` also got a server-side idempotency guard: same name in same org redirects to the existing project. Deleted the duplicate "Test Proj" (proj_test_proj_mrdw35lr, empty) from the ken org.
**Why:** Plain server-action forms allowed double-clicks to fire the action twice — user got two identical projects seconds apart.
**What was considered but not done:** Name-based dedupe guards on the other create actions — refCodes are sequential so duplicates there are visible/deletable, and the disabled button covers the realistic case.
**Tags:** [ux, forms, idempotency, bugfix]

### /design living design-system page — 2026-07-09
**What changed:** New public `/design` route — ShipLock's visual-language reference (tokens, type, spacing, radius, shadows, buttons, StatusBadge, ref codes, KPI cards, forms, tables, empty states, principles). Skeleton copied from portfolio-app's design-system page; principles from Jakub Krehel's make-interfaces-feel-better skill (already installed locally). Added reusable `ui/status-badge.tsx` and `.animate-enter` stagger utility.
**Why:** UI refinement needs a single source of truth to iterate against before touching app screens; current screens feel inconsistent ("tacky").
**What was considered but not done:** Fetching jakub.kr live (site unreachable from this network — used the installed skill instead); framer-motion (kept CSS-only since it isn't a dependency).
**Tags:** [design-system, ui, tooling]

### Portfolio-app design system adopted wholesale — 2026-07-10
**What changed:** Ported portfolio-app's full token set (light+dark) and 11 UI components into shiplock; /design rewritten around them; CLAUDE.md design section rewritten. framer-motion added. Theme default flipped dark→light (old next-themes provider still defaulted dark). shadcn token names kept as aliases so existing screens restyled automatically.
**Why:** Kene: "copy over the full design style and components of my portfolio-app repo — that's what we'd be building shiplock with." One design language across both projects.
**What was considered but not done:** Portfolio's 17px html font-size (kept 16px for data density); portfolio-specific components (PhoneFrame, ProjectPreview, BrandLogos, AnimatedSignature, CursorAvatar) not ported; app screens still use legacy alias classes — migrating them to raw tokens/components is the next refinement pass.
**Tags:** [design-system, ui, tokens, components]

### Full app restyled onto the ported portfolio design system — 2026-07-10
**What changed:** Every app screen (dashboard, requirements, tasks, scope-changes, demos, DoD, blockers, standups, audit log, settings, auth, onboarding, projects list, client review) now composes from the portfolio tokens; dashboard-ui.tsx primitives and charts were tokenized (CSS vars in SVG) so they adapt to dark mode; sidebar got the page-toned rail with white active pill; added `.btn-cta` / `.btn-secondary` / `.btn-danger` / `.field-label` / `.field-input` global classes for server-rendered buttons and forms.
**Why:** The app screens still carried the old /preview hardcoded grays and dark-first shadcn chips; ShipLock should read as an extension of the portfolio — same surfaces, hairline borders, skeuomorphic blue CTA, mono ref-code chips, staggered entrances — tuned denser for a SaaS tool.
**What was considered but not done:** Wrapping every page in the framer-motion Button/Card components — kept server components and used token classes instead to avoid client-boundary churn.
**Tags:** [design-system, tokens, restyle, dark-mode]

### Linear-style shell + HugeIcons migration — 2026-07-10
**What changed:** Sidebar rebuilt Linear-style (220px rail, workspace switcher with gradient lock mark, "Deliver"/"Protect" nav sections, 28px rows, flat active fill); new breadcrumb top bar (`AppTopBar`) in the project layout with theme toggle; page padding tightened (px-5 py-4, gap-4) and `PageHeader` collapsed to a single row; projects page redesigned as a dense full-width row list (h-11 rows, status dot + badge + deadline) instead of a centered card column; org settings matched to the same shell. All icons migrated from lucide-react to HugeIcons via a lucide-name-compatible wrapper (`src/components/icons.tsx`) — only the `/preview` portfolio embed still uses lucide.
**Why:** The app read as a generic centered layout with oversized headers and dead space; Linear/Raycast density (compact rails, breadcrumb bars, row lists) fits a data-heavy delivery tool and the wrapper made the icon swap a one-line import change per file.
**What was considered but not done:** Migrating /preview icons too — left untouched per the "no portfolio changes until verified" rule. Command palette (⌘K) — natural next step for the Linear feel but out of scope.
**Tags:** [layout, sidebar, hugeicons, density, linear-style]

### Prod auth debugging + seeded-role fix — 2026-07-13
**What changed:** Traced a prod "500 Unauthorized on every server action" to an account-role problem, not a session bug: the login `praiseofumaduadike@gmail.com` existed as a pre-seeded `role: "client"` row (`user_client_grc`) from `seed-de-grc.ts`, and every mutating action rejects clients via `requireBuilder`. Flipped that one membership row to `owner`. Also re-gated `auth.ts` `trustedOrigins` so localhost is only trusted in development (an uncommitted working-tree change had trusted localhost in prod), while keeping `BETTER_AUTH_URL` + `VERCEL_URL`.
**Why:** Middleware only checks session-cookie presence and pages never check roles, so a mis-roled account browses fine and only 500s when an action fires. Diagnostic: the root URL `/` 3-way discriminates — → login (bad session) / → onboarding (no membership) / → dashboard (role problem).
**What was considered but not done:** Distinguishing "no session" vs "not a member" in the guard errors — deferred. New public signups are unaffected (onboarding inserts them as owners).
**Tags:** [auth, prod-debugging, bugfix, multi-tenancy]

### Review-fixes batch: AI fallback, DoD validation, hardened import — 2026-07-13
**What changed:** `95a7d52` — `ai.ts` split so a Gemini failure falls through to Anthropic (was re-throwing); API key moved to the `x-goog-api-key` header; Anthropic fallback model bumped to `claude-sonnet-4-6`. `dod.ts` `updateDodItem` now rejects `taskId`/`demoVideoId` that don't belong to the item's project. `requirements.ts` AI import parses JSON defensively (clear error instead of unhandled throw) and batch-inserts to shrink the partial-write window.
**Why:** Post-audit correctness pass on the prior agent's work.
**What was considered but not done:** Migrating to the Vercel AI Gateway (a hook suggested it) — kept the repo's direct-SDK pattern; user is on free-tier Gemini with no paid Anthropic.
**Tags:** [ai, security, bugfix, resilience]

### Multi-tenant project-lookup scoping + error boundary — 2026-07-13
**What changed:** `a4806d0` — added `getProjectForOrg(org, project)` (`src/lib/project.ts`) which inner-joins `projects` to `organizations` and filters on both slugs; replaced the unscoped `eq(projects.slug, project)` lookup in all 15 project pages. `requireBuilder` now `redirect("/login")` on missing session instead of throwing a raw 500, and a new `[org]/[project]/error.tsx` boundary turns action failures into a retry screen.
**Why:** Project slugs aren't globally unique, so an unscoped lookup could load another org's project. And thrown action errors surfaced as raw "Application error" 500s.
**What was considered but not done:** A middleware-level session validity check (still cookie-presence only).
**Tags:** [security, multi-tenancy, ux, error-handling]

### AI import rate-limit + clean errors; scope-creep → Gemini — 2026-07-13
**What changed:** `b6e14b7` — `AIUnavailableError` hides raw provider/billing text; AI import capped at 10/user/rolling-24h (counted from `audit_logs` before the provider call, so a loop can't drain the shared free-tier quota); the import form uses `useActionState` to show specific inline errors. `418138a` — `scope-creep.ts` routed through `callAI` (Gemini) instead of a direct Anthropic client, so it uses the same free-tier key; its two call sites already try/catch so a review still records if AI is down.
**Why:** The AI runs on the owner's key — an open app must not let anyone drain it — and prod hit a Gemini `429 prepayment credits depleted`.
**What was considered but not done:** "Bring your own key" and owner-only gating — user chose Anthropic-optional + a per-user cap; will move Gemini to a billing-disabled free-tier key in Vercel.
**Tags:** [ai, rate-limiting, cost, ux]

### Email invite-link member system — 2026-07-13
**What changed:** `092a304` — owner/builder invites by email + role → signed stateless invite token (`signInviteToken`/`verifyInviteToken`, HMAC, 7-day, no DB table) → emailed link → `/invite/[token]` accept page does signup-or-signin then `acceptInvite` creates the org membership with the assigned role. Replaced the dead "Invite member" button; `/invite` added to public middleware routes. Graceful collision handling (global-unique `users.email`).
**Why:** THE blocker — a real org had no way to add clients/builders, so "Send for review"/"Send to client" silently no-op'd and the whole review flow was unreachable.
**What was considered but not done:** "Direct add by email" and "shareable links only" — user chose the full email-invite flow. Multi-org membership is still blocked by the global-unique email constraint (one org per person for now).
**Tags:** [auth, invites, feature, email]

### Audit logging, dedupe, task timestamps, DoD creation, slug guard — 2026-07-14
**What changed:** `4bce981` + `d91f8a3` — audit_logs now record `created` for requirement/task/demo/scope-change/standup (was updates/deletes only), plus client review decisions and 48h auto-approvals (`userId: null`, reviewer in metadata) — closing the "receipts" gap. Requirement dedupe by normalized title (manual create redirects to the existing one; AI import skips + relinks tasks). `updateTask` sets `completedAt`/`startedAt` on status change so velocity/burndown charts populate. In-product DoD creation (`createDodItem` + `NewDodDialog`) — note `dod_items` requires `requirementId` + a generated `DOD-###` `dodRef`, so the dialog has a requirement picker. `updateOrg` rejects a taken slug with a friendly error instead of a 500.
**Why:** Post-audit build list — the app's core "tamper-evident history" promise was hollow (creations/sign-offs unlogged), charts read empty, and DoD items could only be seeded.
**What was considered but not done:** Task-level dedupe (requirements only, as asked).
**Tags:** [audit, feature, dedupe, metrics, dod]

### /preview refresh — built then reverted — 2026-07-14
**What changed:** `e3a2043` rebuilt the 4 portfolio-embed `/preview` sections (dashboard/requirements/tasks/scope-changes) to match the current app design (accent `#2962db`, card+footer strips, AppSidebar-style rail), verified via Playwright screenshots — then `65fa4a5` REVERTED it because the user prefers the old preview design.
**Why:** User feedback after review: liked the old ones better.
**What was considered but not done:** Do NOT redo the refresh, and do NOT remove `/preview` — it's the portfolio iframe embed (`ProjectPreview.tsx` cycles 4 URLs).
**Tags:** [preview, portfolio-embed, reverted]

### Deferred batch: atomic deletes, ping reminders, silent-form feedback — 2026-07-14
**What changed:** `771b208` — `deleteRequirement`/`deleteDemoVideo` wrapped in a single atomic `db.batch([...])` (neon-http's `db.transaction()` THROWS; `db.batch` runs statements in one atomic request). `7933b30` — `pingReminder24h` now actually sends: for each ping 24h before its 48h auto-approve, it regenerates per-client review tokens and emails a fresh `/review/[token]` link (`sendPingReminderEmail`). `d2a52c8` — the 5 content create dialogs use `useActionState`+`FormState` to show inline validation errors instead of failing silently.
**Why:** User picked these from the deferred list.
**What was considered but not done:** **Demo upload** — uploadthing is NOT installed (only env vars set); needs full install + file-router + `<video>` playback on demo/review pages; user chose to skip. The 4 standalone `/new` full-page forms still discard errors (legacy, superseded by dialogs — see next entry).
**Tags:** [resilience, email, forms, ux]

### Retired legacy /new routes; status_emails left as-is — 2026-07-14
**What changed:** `1a61443` — deleted the orphaned full-page create routes `tasks/new`, `demos/new`, `requirements/new`, `scope-changes/new` (superseded by dialogs, no inbound links). Kept `projects/new` (still linked from the sidebar switcher). `status_emails` (dead table + `statusEmailTypeEnum`, never read/written — scaffolding for an unbuilt weekly-status digest) left untouched per user choice.
**Why:** Cleanup of dead surface after the dialog migration.
**What was considered but not done:** Removing `status_emails` or building the weekly digest (left for later); converting `projects/new` to a dialog. Note: deleting routes left stale `.next/types/**/new/*` stubs that fail `tsc` until the dev server recompiles — clear the specific stubs, never `rm .next` while the dev server is live.
**Tags:** [cleanup, routes, dead-code]
