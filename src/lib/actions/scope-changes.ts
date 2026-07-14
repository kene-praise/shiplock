"use server";

import { db } from "@/db";
import { scopeChanges, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireBuilder, requireProjectInOrg } from "./guard";
import type { FormState } from "./form-state";

export async function createScopeChange(
  projectId: string,
  org: string,
  project: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const member = await requireBuilder(org);
  await requireProjectInOrg(projectId, member.orgId);

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const source = (formData.get("source") as string) ?? "client_request";
  const sourceDetail = (formData.get("sourceDetail") as string)?.trim() || null;
  const impactDescription = (formData.get("impactDescription") as string)?.trim();
  const estimatedDaysRaw = formData.get("estimatedDays") as string;
  const estimatedDays = estimatedDaysRaw ? parseInt(estimatedDaysRaw, 10) : null;

  if (!title || !description || !impactDescription) return { error: "Title, description, and impact are required." };

  const [newRow] = await db.insert(scopeChanges).values({
    projectId,
    title,
    description,
    source: source as "client_request" | "meeting" | "internal",
    sourceDetail,
    impactDescription,
    estimatedDays,
    status: "pending",
  }).returning();

  await db.insert(auditLogs).values({
    projectId,
    userId: member.user.id,
    action: "created",
    entityType: "scope_change",
    entityId: newRow.id,
    newValue: newRow,
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
  const member = await requireBuilder(org);

  const [change] = await db
    .select({ projectId: scopeChanges.projectId })
    .from(scopeChanges)
    .where(eq(scopeChanges.id, id))
    .limit(1);
  if (!change) return;
  await requireProjectInOrg(change.projectId, member.orgId);

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

export async function updateScopeChange(
  id: string,
  org: string,
  project: string,
  formData: FormData
) {
  const member = await requireBuilder(org);

  const [oldChange] = await db
    .select()
    .from(scopeChanges)
    .where(eq(scopeChanges.id, id))
    .limit(1);

  if (!oldChange) throw new Error("Not found");
  await requireProjectInOrg(oldChange.projectId, member.orgId);

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const source = formData.get("source") as string;
  const sourceDetail = (formData.get("sourceDetail") as string)?.trim() || null;
  const impactDescription = (formData.get("impactDescription") as string)?.trim();
  const estimatedDaysRaw = formData.get("estimatedDays") as string;
  const estimatedDays = estimatedDaysRaw ? parseInt(estimatedDaysRaw, 10) : null;
  const status = formData.get("status") as string;

  if (!title || !description || !impactDescription) return;

  const [newChange] = await db
    .update(scopeChanges)
    .set({
      title,
      description,
      source: source as "client_request" | "meeting" | "internal",
      sourceDetail,
      impactDescription,
      estimatedDays,
      status: status as "pending" | "accepted" | "rejected" | "deferred",
      updatedAt: new Date(),
    })
    .where(eq(scopeChanges.id, id))
    .returning();

  // Insert audit log
  await db.insert(auditLogs).values({
    projectId: oldChange.projectId,
    userId: member.user.id,
    action: "updated",
    entityType: "scope_change",
    entityId: id,
    oldValue: oldChange,
    newValue: newChange,
  });

  revalidatePath(`/${org}/${project}/scope-changes`);
}
