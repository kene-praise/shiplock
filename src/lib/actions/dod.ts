"use server";

import { db } from "@/db";
import { dodItems, demoVideos, tasks, auditLogs, requirements } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireBuilder, requireProjectInOrg } from "./guard";

export async function createDodItem(
  projectId: string,
  org: string,
  project: string,
  formData: FormData
) {
  const member = await requireBuilder(org);
  await requireProjectInOrg(projectId, member.orgId);

  const criterion = (formData.get("criterion") as string)?.trim();
  if (!criterion) return;

  const requirementId = (formData.get("requirementId") as string)?.trim();
  if (!requirementId) return;

  const [req] = await db
    .select({ id: requirements.id })
    .from(requirements)
    .where(and(eq(requirements.id, requirementId), eq(requirements.projectId, projectId)))
    .limit(1);
  if (!req) return;

  const existing = await db
    .select({ dodRef: dodItems.dodRef })
    .from(dodItems)
    .where(eq(dodItems.projectId, projectId));
  const max = existing.reduce((m, r) => {
    const n = parseInt((r.dodRef ?? "").replace("DOD-", ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  const dodRef = `DOD-${String(max + 1).padStart(3, "0")}`;

  await db.insert(dodItems).values({ projectId, requirementId, dodRef, criterion, met: false });

  revalidatePath(`/${org}/${project}/dod`);
}

async function requireDodItem(dodItemId: string, org: string) {
  const member = await requireBuilder(org);
  const [item] = await db
    .select()
    .from(dodItems)
    .where(eq(dodItems.id, dodItemId))
    .limit(1);
  if (!item) throw new Error("Not found");
  await requireProjectInOrg(item.projectId, member.orgId);
  return item;
}

export async function markDodMet(dodItemId: string, org: string, project: string) {
  await requireDodItem(dodItemId, org);

  await db
    .update(dodItems)
    .set({ met: true, metAt: new Date(), updatedAt: new Date() })
    .where(eq(dodItems.id, dodItemId));

  revalidatePath(`/${org}/${project}/dod`);
}

export async function markDodUnmet(dodItemId: string, org: string, project: string) {
  await requireDodItem(dodItemId, org);

  await db
    .update(dodItems)
    .set({ met: false, metAt: null, updatedAt: new Date() })
    .where(eq(dodItems.id, dodItemId));

  revalidatePath(`/${org}/${project}/dod`);
}

export async function linkVideotoDod(
  dodItemId: string,
  demoVideoId: string,
  org: string,
  project: string
) {
  const item = await requireDodItem(dodItemId, org);

  // The linked video must belong to the same project as the DoD item.
  const [video] = await db
    .select({ projectId: demoVideos.projectId })
    .from(demoVideos)
    .where(eq(demoVideos.id, demoVideoId))
    .limit(1);
  if (!video || video.projectId !== item.projectId) throw new Error("Unauthorized");

  await db
    .update(dodItems)
    .set({ demoVideoId, updatedAt: new Date() })
    .where(eq(dodItems.id, dodItemId));

  revalidatePath(`/${org}/${project}/dod`);
}

export async function updateDodItem(
  id: string,
  org: string,
  project: string,
  formData: FormData
) {
  const oldItem = await requireDodItem(id, org);
  const member = await requireBuilder(org);

  const criterion = (formData.get("criterion") as string)?.trim();
  const metRaw = formData.get("met") as string;
  const met = metRaw === "true";
  const taskId = (formData.get("taskId") as string) || null;
  const demoVideoId = (formData.get("demoVideoId") as string) || null;

  if (!criterion) return;

  // Linked task/video must belong to the same project as the DoD item.
  if (taskId) {
    const [t] = await db
      .select({ projectId: tasks.projectId })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);
    if (!t || t.projectId !== oldItem.projectId) throw new Error("Unauthorized");
  }
  if (demoVideoId) {
    const [v] = await db
      .select({ projectId: demoVideos.projectId })
      .from(demoVideos)
      .where(eq(demoVideos.id, demoVideoId))
      .limit(1);
    if (!v || v.projectId !== oldItem.projectId) throw new Error("Unauthorized");
  }

  const [newItem] = await db
    .update(dodItems)
    .set({
      criterion,
      met,
      metAt: met ? (oldItem.met ? oldItem.metAt : new Date()) : null,
      taskId,
      demoVideoId,
      updatedAt: new Date(),
    })
    .where(eq(dodItems.id, id))
    .returning();

  // Insert audit log
  await db.insert(auditLogs).values({
    projectId: oldItem.projectId,
    userId: member.user.id,
    action: "updated",
    entityType: "dod",
    entityId: id,
    oldValue: oldItem,
    newValue: newItem,
  });

  revalidatePath(`/${org}/${project}/dod`);
}
