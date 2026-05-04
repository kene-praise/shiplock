"use server";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priority = (formData.get("priority") as string) || "p2_medium";
  const week = (formData.get("week") as string)?.trim() || null;
  const requirementId = (formData.get("requirementId") as string) || null;

  if (!title) return;

  const refCode = await nextRefCode(projectId);

  await db.insert(tasks).values({
    projectId,
    refCode,
    title,
    description,
    ownerId: "user_kene",
    priority: priority as "p0_critical" | "p1_high" | "p2_medium" | "p3_low",
    status: "not_started",
    week,
    requirementId: requirementId || null,
  });

  revalidatePath(`/${org}/${project}/tasks`);
  redirect(`/${org}/${project}/tasks`);
}
