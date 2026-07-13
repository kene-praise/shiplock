import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, organizations } from "@/db/schema";

// Resolve a project by slug scoped to its organization. Project slugs are not
// globally unique, so an unscoped lookup can cross tenant boundaries.
export async function getProjectForOrg(org: string, project: string) {
  const [row] = await db
    .select()
    .from(projects)
    .innerJoin(organizations, eq(projects.orgId, organizations.id))
    .where(and(eq(organizations.slug, org), eq(projects.slug, project)))
    .limit(1);
  return row?.projects ?? null;
}
