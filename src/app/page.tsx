import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, organizations } from "@/db/schema";

// Root resolves the signed-in user's own org and sends them there.
// No org yet → onboarding. No session → login.
export default async function RootPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const [appUser] = await db
    .select({ orgSlug: organizations.slug })
    .from(users)
    .innerJoin(organizations, eq(users.orgId, organizations.id))
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (!appUser) {
    redirect("/onboarding");
  }

  redirect(`/${appUser.orgSlug}/projects`);
}
