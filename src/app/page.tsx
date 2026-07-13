import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, organizations, projects } from "@/db/schema";

export default async function RootPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const [appUser] = await db
    .select({ orgId: organizations.id, orgSlug: organizations.slug })
    .from(users)
    .innerJoin(organizations, eq(users.orgId, organizations.id))
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (!appUser) {
    redirect("/onboarding");
  }

  // Land directly in the first active project, falling back to any project.
  const [activeProject] = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(and(eq(projects.orgId, appUser.orgId), eq(projects.status, "active")))
    .limit(1);

  if (activeProject) {
    redirect(`/${appUser.orgSlug}/${activeProject.slug}/dashboard`);
  }

  const [anyProject] = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(eq(projects.orgId, appUser.orgId))
    .limit(1);

  if (anyProject) {
    redirect(`/${appUser.orgSlug}/${anyProject.slug}/dashboard`);
  }

  // No projects yet — show the projects page so they can create one.
  redirect(`/${appUser.orgSlug}/projects`);
}
