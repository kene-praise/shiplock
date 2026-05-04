"use server";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createProject(orgId: string, org: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const mvpDeadline = (formData.get("mvpDeadline") as string) || null;

  if (!name) return;

  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  const id = "proj_" + baseSlug.replace(/-/g, "_").slice(0, 20) + "_" + Date.now().toString(36);
  const slug = baseSlug + "-" + Date.now().toString(36).slice(-4);

  await db.insert(projects).values({
    id,
    orgId,
    name,
    slug,
    description,
    status: "active",
    mvpDeadline,
  });

  revalidatePath(`/${org}/projects`);
  redirect(`/${org}/${slug}/dashboard`);
}

export async function updateProject(projectId: string, projectSlug: string, org: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = formData.get("status") as string;
  const mvpDeadline = (formData.get("mvpDeadline") as string) || null;

  if (!name) return;

  await db
    .update(projects)
    .set({ name, description, status: status as "active" | "paused" | "completed" | "archived", mvpDeadline, updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  revalidatePath(`/${org}/${projectSlug}/settings`);
  revalidatePath(`/${org}/projects`);
}

export async function archiveProject(projectId: string, org: string) {
  await db
    .update(projects)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  revalidatePath(`/${org}/projects`);
  redirect(`/${org}/projects`);
}
