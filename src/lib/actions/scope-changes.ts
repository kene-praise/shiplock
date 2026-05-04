"use server";

import { db } from "@/db";
import { scopeChanges } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createScopeChange(
  projectId: string,
  org: string,
  project: string,
  formData: FormData
) {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const source = (formData.get("source") as string) ?? "client_request";
  const sourceDetail = (formData.get("sourceDetail") as string)?.trim() || null;
  const impactDescription = (formData.get("impactDescription") as string)?.trim();
  const estimatedDaysRaw = formData.get("estimatedDays") as string;
  const estimatedDays = estimatedDaysRaw ? parseInt(estimatedDaysRaw, 10) : null;

  if (!title || !description || !impactDescription) return;

  await db.insert(scopeChanges).values({
    projectId,
    title,
    description,
    source: source as "client_request" | "meeting" | "internal",
    sourceDetail,
    impactDescription,
    estimatedDays,
    status: "pending",
  });

  revalidatePath(`/${org}/${project}/scope-changes`);
  redirect(`/${org}/${project}/scope-changes`);
}

export async function updateScopeChangeStatus(
  id: string,
  status: "accepted" | "rejected" | "deferred",
  org: string,
  project: string
) {
  await db
    .update(scopeChanges)
    .set({
      status,
      acknowledgedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scopeChanges.id, id));

  revalidatePath(`/${org}/${project}/scope-changes`);
  redirect(`/${org}/${project}/scope-changes/${id}`);
}
