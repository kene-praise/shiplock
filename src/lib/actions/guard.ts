import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { organizations, users, projects } from "@/db/schema";

/**
 * Server-action authorization guard. The session cookie only proves the caller
 * is logged in — these helpers prove they may touch the org/project they name.
 */

export type Member = {
  user: typeof users.$inferSelect;
  orgId: string;
};

// Caller must be an owner/builder member of the org with this slug.
export async function requireBuilder(orgSlug: string): Promise<Member> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const [row] = await db
    .select({ user: users, orgId: organizations.id })
    .from(users)
    .innerJoin(organizations, eq(users.orgId, organizations.id))
    .where(and(eq(users.email, session.user.email), eq(organizations.slug, orgSlug)))
    .limit(1);

  if (!row || row.user.role === "client") throw new Error("Unauthorized");
  return row;
}

// The project must belong to the caller's org.
export async function requireProjectInOrg(projectId: string, orgId: string) {
  const [proj] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.orgId, orgId)))
    .limit(1);

  if (!proj) throw new Error("Unauthorized");
  return proj;
}
