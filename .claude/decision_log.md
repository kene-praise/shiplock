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
