"use server";

import { db } from "@/db";
import { standups, auditLogs } from "@/db/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireBuilder, requireProjectInOrg } from "./guard";
import type { FormState } from "./form-state";

export async function createStandup(
  projectId: string,
  org: string,
  project: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const member = await requireBuilder(org);
  await requireProjectInOrg(projectId, member.orgId);

  const didYesterday = (formData.get("didYesterday") as string)?.trim();
  const doingToday = (formData.get("doingToday") as string)?.trim();
  const blockers = (formData.get("blockers") as string)?.trim() || null;

  if (!didYesterday || !doingToday) return { error: "Fill in what you did and what you're doing today." };

  const today = new Date().toISOString().split("T")[0];

  const [newRow] = await db.insert(standups).values({
    projectId,
    userId: member.user.id,
    date: today,
    didYesterday,
    doingToday,
    blockers,
  }).returning();

  await db.insert(auditLogs).values({
    projectId,
    userId: member.user.id,
    action: "created",
    entityType: "standup",
    entityId: newRow.id,
    newValue: newRow,
  });

  revalidatePath(`/${org}/${project}/standups`);
  redirect(`/${org}/${project}/standups`);
}
