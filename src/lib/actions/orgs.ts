"use server";

import { db } from "@/db";
import { organizations, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireBuilder } from "./guard";

export async function createOrgForCurrentUser(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  // Already in an org? Just go there.
  const [existing] = await db
    .select({ orgSlug: organizations.slug })
    .from(users)
    .innerJoin(organizations, eq(users.orgId, organizations.id))
    .where(eq(users.email, session.user.email))
    .limit(1);
  if (existing) redirect(`/${existing.orgSlug}/projects`);

  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  const suffix = Date.now().toString(36).slice(-4);

  const [slugTaken] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, baseSlug))
    .limit(1);
  const slug = slugTaken ? `${baseSlug}-${suffix}` : baseSlug;

  const orgId = "org_" + baseSlug.replace(/-/g, "_").slice(0, 20) + "_" + suffix;

  await db.insert(organizations).values({ id: orgId, name, slug });
  await db.insert(users).values({
    id: "user_" + session.user.id,
    orgId,
    email: session.user.email,
    name: session.user.name || session.user.email,
    role: "owner",
  });

  redirect(`/${slug}/projects`);
}

export async function updateOrg(orgId: string, currentSlug: string, formData: FormData) {
  const member = await requireBuilder(currentSlug);
  if (member.orgId !== orgId) throw new Error("Unauthorized");

  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase().replace(/\s+/g, "-");

  if (!name || !slug) return;

  await db
    .update(organizations)
    .set({ name, slug, updatedAt: new Date() })
    .where(eq(organizations.id, orgId));

  revalidatePath(`/${slug}/settings`);

  if (slug !== currentSlug) {
    redirect(`/${slug}/settings`);
  }
}
