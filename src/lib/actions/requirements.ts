"use server";

import { db } from "@/db";
import { requirements, clientPings, users, projects, auditLogs, tasks, demoVideos, clientReviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signReviewToken } from "@/lib/signed-url";
import { sendRequirementReviewEmail } from "@/lib/email";
import { requireBuilder, requireProjectInOrg } from "./guard";

async function nextRefCode(projectId: string): Promise<string> {
  const existing = await db
    .select({ refCode: requirements.refCode })
    .from(requirements)
    .where(eq(requirements.projectId, projectId));
  const max = existing.reduce((m, r) => {
    const n = parseInt(r.refCode.replace("REQ-", ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `REQ-${String(max + 1).padStart(3, "0")}`;
}

export async function createRequirement(
  projectId: string,
  org: string,
  project: string,
  formData: FormData
) {
  const member = await requireBuilder(org);
  await requireProjectInOrg(projectId, member.orgId);

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const source = (formData.get("source") as string) || "meeting";
  const sourceDetail = (formData.get("sourceDetail") as string)?.trim() || null;
  const classification = (formData.get("classification") as string) || "mvp";

  if (!title || !description) return;

  const refCode = await nextRefCode(projectId);

  await db.insert(requirements).values({
    projectId,
    refCode,
    title,
    description,
    source: source as "document" | "meeting" | "email" | "verbal",
    sourceDetail,
    classification: classification as "mvp" | "post_mvp" | "out_of_scope",
    status: "draft",
  });

  revalidatePath(`/${org}/${project}/requirements`);
  redirect(`/${org}/${project}/requirements`);
}

export async function sendRequirementForReview(
  requirementId: string,
  org: string,
  project: string
) {
  const member = await requireBuilder(org);

  const [req] = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, requirementId))
    .limit(1);
  if (!req || req.status === "approved") return;

  const [projectData] = await db
    .select({ id: projects.id, name: projects.name, orgId: projects.orgId })
    .from(projects)
    .where(and(eq(projects.slug, project), eq(projects.orgId, member.orgId)))
    .limit(1);
  if (!projectData || req.projectId !== projectData.id) return;

  const clientUsers = await db
    .select()
    .from(users)
    .where(and(eq(users.orgId, projectData.orgId), eq(users.role, "client")));
  if (clientUsers.length === 0) return;

  const AUTO_APPROVE_HOURS = 48;
  const deadline = new Date(Date.now() + AUTO_APPROVE_HOURS * 60 * 60 * 1000);

  const [ping] = await db
    .insert(clientPings)
    .values({
      projectId: projectData.id,
      type: "requirement_review",
      referenceId: req.id,
      referenceType: "requirement",
      sentAt: new Date(),
      deadline,
      status: "pending",
    })
    .returning();

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  await db
    .update(requirements)
    .set({ status: "pending_approval", autoApproveDeadline: deadline, updatedAt: new Date() })
    .where(eq(requirements.id, requirementId));

  // Per-recipient token — each client gets a link tied to their email
  await Promise.all(
    clientUsers.map((client) => {
      const token = signReviewToken(
        {
          type: "requirement",
          referenceId: req.id,
          pingId: ping.id,
          projectId: projectData.id,
          reviewerEmail: client.email,
        },
        7
      );
      return sendRequirementReviewEmail({
        to: client.email,
        projectName: projectData.name,
        reqRefCode: req.refCode,
        reqTitle: req.title,
        reviewUrl: `${baseUrl}/review/${token}`,
        expiresInDays: 7,
      });
    })
  );

  revalidatePath(`/${org}/${project}/requirements`);
  revalidatePath(`/${org}/${project}/requirements/${requirementId}`);
}

export async function deleteRequirement(
  requirementId: string,
  org: string,
  project: string
) {
  const member = await requireBuilder(org);

  const [req] = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, requirementId))
    .limit(1);

  if (!req) return;
  await requireProjectInOrg(req.projectId, member.orgId);

  // Clear references to prevent foreign key errors
  await db.update(tasks).set({ requirementId: null }).where(eq(tasks.requirementId, requirementId));
  await db.update(demoVideos).set({ requirementId: null }).where(eq(demoVideos.requirementId, requirementId));
  await db.delete(clientReviews).where(eq(clientReviews.requirementId, requirementId));

  // Insert audit log
  await db.insert(auditLogs).values({
    projectId: req.projectId,
    userId: member.user.id,
    action: "deleted",
    entityType: "requirement",
    entityId: req.id as string,
    oldValue: req,
  });

  await db.delete(requirements).where(eq(requirements.id, requirementId));

  revalidatePath(`/${org}/${project}/requirements`);
  redirect(`/${org}/${project}/requirements`);
}
