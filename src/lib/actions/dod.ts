"use server";

import { db } from "@/db";
import { dodItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markDodMet(dodItemId: string, org: string, project: string) {
  await db
    .update(dodItems)
    .set({ met: true, metAt: new Date(), updatedAt: new Date() })
    .where(eq(dodItems.id, dodItemId));

  revalidatePath(`/${org}/${project}/dod`);
}

export async function markDodUnmet(dodItemId: string, org: string, project: string) {
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
  await db
    .update(dodItems)
    .set({ demoVideoId, updatedAt: new Date() })
    .where(eq(dodItems.id, dodItemId));

  revalidatePath(`/${org}/${project}/dod`);
}
