"use server";

import { db } from "@/db";
import { standups } from "@/db/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createStandup(
  projectId: string,
  userId: string,
  org: string,
  project: string,
  formData: FormData
) {
  const didYesterday = (formData.get("didYesterday") as string)?.trim();
  const doingToday = (formData.get("doingToday") as string)?.trim();
  const blockers = (formData.get("blockers") as string)?.trim() || null;

  if (!didYesterday || !doingToday) return;

  const today = new Date().toISOString().split("T")[0];

  await db.insert(standups).values({
    projectId,
    userId,
    date: today,
    didYesterday,
    doingToday,
    blockers,
  });

  revalidatePath(`/${org}/${project}/standups`);
  redirect(`/${org}/${project}/standups`);
}
