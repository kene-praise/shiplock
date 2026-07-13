import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { Lock } from "@/components/icons";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, organizations } from "@/db/schema";
import { createOrgForCurrentUser } from "@/lib/actions/orgs";
import { SubmitButton } from "@/components/submit-button";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const [existing] = await db
    .select({ orgSlug: organizations.slug })
    .from(users)
    .innerJoin(organizations, eq(users.orgId, organizations.id))
    .where(eq(users.email, session.user.email))
    .limit(1);
  if (existing) redirect(`/${existing.orgSlug}/projects`);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--component-fill)] border border-[var(--border)] outline outline-1 outline-[var(--border)] outline-offset-2 flex items-center justify-center">
            <Lock className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-tight text-[var(--fg)]">
              Set up your workspace
            </h1>
            <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
              Name your studio or team — you can change this later.
            </p>
          </div>
        </div>

        <form action={createOrgForCurrentUser} className="space-y-4">
          <div className="space-y-1.5">
            <label className="field-label">
              Studio / team name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Acme Studio"
              className="field-input"
            />
          </div>

          <SubmitButton
            pendingText="Creating…"
            className="btn-cta w-full"
          >
            Create workspace
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
