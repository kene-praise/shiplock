import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { Lock } from "lucide-react";
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
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Set up your workspace
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Name your studio or team — you can change this later.
            </p>
          </div>
        </div>

        <form action={createOrgForCurrentUser} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Studio / team name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Acme Studio"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>

          <SubmitButton
            pendingText="Creating…"
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-sm font-medium transition-colors"
          >
            Create workspace
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
