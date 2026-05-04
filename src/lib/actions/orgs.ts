"use server";

import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateOrg(orgId: string, currentSlug: string, formData: FormData) {
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
