"use server";

import { db } from "@/db";
import { tasks, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireBuilder, requireProjectInOrg } from "./guard";

async function nextRefCode(projectId: string): Promise<string> {
  const existing = await db
    .select({ refCode: tasks.refCode })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));
  const max = existing.reduce((m, t) => {
    const n = parseInt(t.refCode.replace("T-", ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `T-${String(max + 1).padStart(3, "0")}`;
}

export async function createTask(
  projectId: string,
  org: string,
  project: string,
  formData: FormData
) {
  const member = await requireBuilder(org);
  await requireProjectInOrg(projectId, member.orgId);

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priority = (formData.get("priority") as string) || "p2_medium";
  const week = (formData.get("week") as string)?.trim() || null;
  const requirementId = (formData.get("requirementId") as string) || null;

  if (!title) return;

  const refCode = await nextRefCode(projectId);

  const [newRow] = await db.insert(tasks).values({
    projectId,
    refCode,
    title,
    description,
    ownerId: member.user.id,
    priority: priority as "p0_critical" | "p1_high" | "p2_medium" | "p3_low",
    status: "not_started",
    week,
    requirementId: requirementId || null,
  }).returning();

  await db.insert(auditLogs).values({
    projectId,
    userId: member.user.id,
    action: "created",
    entityType: "task",
    entityId: newRow.id,
    newValue: newRow,
  });

  revalidatePath(`/${org}/${project}/tasks`);
  redirect(`/${org}/${project}/tasks`);
}

export async function updateTask(
  id: string,
  org: string,
  project: string,
  formData: FormData
) {
  const member = await requireBuilder(org);

  const [oldTask] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1);

  if (!oldTask) throw new Error("Not found");
  await requireProjectInOrg(oldTask.projectId, member.orgId);

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = formData.get("status") as string;
  const priority = formData.get("priority") as string;
  const week = (formData.get("week") as string)?.trim() || null;
  const blockedBy = (formData.get("blockedBy") as string)?.trim() || null;
  const blockedReason = (formData.get("blockedReason") as string)?.trim() || null;
  const dodRef = (formData.get("dodRef") as string)?.trim() || null;
  const requirementId = (formData.get("requirementId") as string) || null;

  if (!title) return;

  const timestamps: { completedAt?: Date | null; startedAt?: Date } = {};
  if (status === "done" && oldTask.status !== "done") {
    timestamps.completedAt = new Date();
  } else if (status !== "done" && oldTask.status === "done") {
    timestamps.completedAt = null;
  }
  if (status === "in_progress" && oldTask.startedAt === null) {
    timestamps.startedAt = new Date();
  }

  const [newTask] = await db
    .update(tasks)
    .set({
      title,
      description,
      status: status as "not_started" | "in_progress" | "blocked" | "done" | "cut",
      priority: priority as "p0_critical" | "p1_high" | "p2_medium" | "p3_low",
      week,
      blockedBy,
      blockedReason,
      dodRef,
      requirementId: requirementId || null,
      ...timestamps,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id))
    .returning();

  // Insert audit log
  await db.insert(auditLogs).values({
    projectId: oldTask.projectId,
    userId: member.user.id,
    action: "updated",
    entityType: "task",
    entityId: id,
    oldValue: oldTask,
    newValue: newTask,
  });

  revalidatePath(`/${org}/${project}/tasks`);
}
