import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, organizations } from "@/db/schema";

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}

// Gate every org-scoped route: the signed-in user must be a member of this org.
export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { org } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/login");
  }

  const [membership] = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(organizations, eq(users.orgId, organizations.id))
    .where(and(eq(users.email, session.user.email), eq(organizations.slug, org)))
    .limit(1);

  if (!membership) {
    // Not a member — send them back to their own org (or onboarding).
    redirect("/");
  }

  return <>{children}</>;
}
