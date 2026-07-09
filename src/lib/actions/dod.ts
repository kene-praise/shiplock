"use server";

import { db } from "@/db";
import { dodItems, demoVideos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireBuilder, requireProjectInOrg } from "./guard";

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
