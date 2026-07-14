"use server";

import { db } from "@/db";
import { demoVideos, clientPings, users, projects, auditLogs, dodItems, clientReviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signReviewToken } from "@/lib/signed-url";
import { sendDemoReviewEmail } from "@/lib/email";
import { requireBuilder, requireProjectInOrg } from "./guard";

export async function createDemo(
  projectId: string,
  org: string,
  project: string,
  formData: FormData
) {
  const member = await requireBuilder(org);
  await requireProjectInOrg(projectId, member.orgId);

  const title = (formData.get("title") as string)?.trim();
  const videoUrl = (formData.get("videoUrl") as string)?.trim();
  const recordedAt = (formData.get("recordedAt") as string) || new Date().toISOString();
  const durationRaw = formData.get("durationSeconds") as string;
  const durationSeconds = durationRaw ? parseInt(durationRaw, 10) : null;
  const requirementId = (formData.get("requirementId") as string) || null;

  if (!title || !videoUrl) return;

  const [newRow] = await db.insert(demoVideos).values({
    projectId,
    title,
    videoUrl,
    recordedAt: new Date(recordedAt),
    durationSeconds,
    requirementId: requirementId || undefined,
    sentToClient: false,
    clientStatus: "pending",
  }).returning();

  await db.insert(auditLogs).values({
    projectId,
    userId: member.user.id,
    action: "created",
    entityType: "demo",
    entityId: newRow.id,
    newValue: newRow,
  });

  revalidatePath(`/${org}/${project}/demos`);
  redirect(`/${org}/${project}/demos`);
}

export async function sendDemoToClient(demoId: string, org: string, project: string) {
  const member = await requireBuilder(org);

  const [demo] = await db.select().from(demoVideos).where(eq(demoVideos.id, demoId)).limit(1);
  if (!demo || demo.sentToClient) return;

  const [projectData] = await db
    .select({ id: projects.id, name: projects.name, orgId: projects.orgId })
    .from(projects)
    .where(and(eq(projects.slug, project), eq(projects.orgId, member.orgId)))
    .limit(1);
  if (!projectData || demo.projectId !== projectData.id) return;

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
      type: "demo_review",
      referenceId: demo.id,
      referenceType: "demo",
      sentAt: new Date(),
      deadline,
      status: "pending",
    })
    .returning();

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  await db
    .update(demoVideos)
    .set({
      sentToClient: true,
      sentAt: new Date(),
      autoApproveDeadline: deadline,
      updatedAt: new Date(),
    })
    .where(eq(demoVideos.id, demoId));

  // Per-recipient token — each client gets a link tied to their email
  await Promise.all(
    clientUsers.map((client) => {
      const token = signReviewToken(
        {
          type: "demo",
          referenceId: demo.id,
          pingId: ping.id,
          projectId: projectData.id,
          reviewerEmail: client.email,
        },
        7
      );
      return sendDemoReviewEmail({
        to: client.email,
        projectName: projectData.name,
        demoTitle: demo.title,
        reviewUrl: `${baseUrl}/review/${token}`,
        expiresInDays: 7,
      });
    })
  );

  revalidatePath(`/${org}/${project}/demos`);
}

export async function deleteDemoVideo(
  demoId: string,
  org: string,
  project: string
) {
  const member = await requireBuilder(org);

  const [demo] = await db
    .select()
    .from(demoVideos)
    .where(eq(demoVideos.id, demoId))
    .limit(1);

  if (!demo) return;
  await requireProjectInOrg(demo.projectId, member.orgId);

  // Clear references to prevent foreign key errors
  await db.update(dodItems).set({ demoVideoId: null }).where(eq(dodItems.demoVideoId, demoId));
  await db.delete(clientReviews).where(eq(clientReviews.demoVideoId, demoId));

  // Insert audit log
  await db.insert(auditLogs).values({
    projectId: demo.projectId,
    userId: member.user.id,
    action: "deleted",
    entityType: "demo_video",
    entityId: demo.id as string,
    oldValue: demo,
  });

  await db.delete(demoVideos).where(eq(demoVideos.id, demoId));

  revalidatePath(`/${org}/${project}/demos`);
  redirect(`/${org}/${project}/demos`);
}
