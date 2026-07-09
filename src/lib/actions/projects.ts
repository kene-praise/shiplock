"use server";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireBuilder, requireProjectInOrg } from "./guard";

export async function createProject(orgId: string, org: string, formData: FormData) {
  const member = await requireBuilder(org);
  if (member.orgId !== orgId) throw new Error("Unauthorized");

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const mvpDeadline = (formData.get("mvpDeadline") as string) || null;

  if (!name) return;

  // Idempotency guard: a double submit (or retry) of the same name lands on
  // the existing project instead of creating a twin.
  const [duplicate] = await db
    .select({ slug: projects.slug })
    .from(projects)
    .where(and(eq(projects.orgId, orgId), eq(projects.name, name)))
    .limit(1);
  if (duplicate) redirect(`/${org}/${duplicate.slug}/dashboard`);

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
  const member = await requireBuilder(org);
  await requireProjectInOrg(projectId, member.orgId);

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
  const member = await requireBuilder(org);
  await requireProjectInOrg(projectId, member.orgId);

  await db
    .update(projects)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(projects.id, projectId));

  revalidatePath(`/${org}/projects`);
  redirect(`/${org}/projects`);
}
