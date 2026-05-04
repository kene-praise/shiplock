"use server";

import { db } from "@/db";
import {
  requirements,
  demoVideos,
  clientPings,
  clientReviews,
  scopeChanges,
  users,
  projects,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { verifyReviewToken } from "@/lib/signed-url";
import { redirect } from "next/navigation";
import { detectScopeCreep } from "@/lib/scope-creep";
import { sendBuilderReviewNotificationEmail } from "@/lib/email";

async function notifyBuilders(
  projectId: string,
  payload: {
    reviewerName: string;
    reviewerEmail: string;
    itemTitle: string;
    itemType: "requirement" | "demo";
    decision: "approved" | "disputed" | "rejected";
    comment?: string | null;
    scopeCreepDetected?: boolean;
  }
) {
  const proj = await db
    .select({ name: projects.name, orgId: projects.orgId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!proj[0]) return;

  const builders = await db
    .select({ email: users.email })
    .from(users)
    .where(
      and(
        eq(users.orgId, proj[0].orgId),
        inArray(users.role, ["owner", "builder"])
      )
    );

  await Promise.all(
    builders.map((b) =>
      sendBuilderReviewNotificationEmail({
        to: b.email,
        projectName: proj[0].name,
        ...payload,
      })
    )
  );
}

export async function submitRequirementReview(
  token: string,
  decision: "approved" | "disputed",
  formData: FormData
) {
  const payload = verifyReviewToken(token);
  if (!payload || payload.type !== "requirement")
    redirect(`/review/${token}?error=invalid`);

  const reviewerName = ((formData.get("reviewerName") as string) ?? "").trim();
  const comment = ((formData.get("comment") as string) ?? "").trim() || null;
  const reviewerEmail = payload.reviewerEmail;

  if (!reviewerName) redirect(`/review/${token}?error=name_required`);

  const [req] = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, payload.referenceId))
    .limit(1);

  if (!req) redirect(`/review/${token}?error=invalid`);

  // Record the individual sign-off
  let scopeCreepDetected = false;
  let scopeCreepSummary: string | undefined;

  if (decision === "disputed" && comment) {
    try {
      const result = await detectScopeCreep(req.title, req.description, comment);
      scopeCreepDetected = result.detected;
      scopeCreepSummary = result.summary ?? undefined;

      if (result.detected && result.title && result.description) {
        await db.insert(scopeChanges).values({
          projectId: payload.projectId,
          title: result.title,
          description: result.description,
          source: "client_request",
          sourceDetail: `Auto-detected from ${reviewerName} (${reviewerEmail}) rejection of ${req.refCode}`,
          impactDescription: "Impact to be assessed by the team.",
          status: "pending",
        });
      }
    } catch {
      // Don't fail the review submission if AI detection errors
    }
  }

  await db.insert(clientReviews).values({
    projectId: payload.projectId,
    pingId: payload.pingId,
    requirementId: req.id,
    reviewerName,
    reviewerEmail,
    decision,
    comment,
    scopeCreepDetected,
    scopeCreepSummary: scopeCreepSummary ?? null,
  });

  // Update requirement status
  await db
    .update(requirements)
    .set({
      status: decision,
      clientApprovedAt: decision === "approved" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(requirements.id, payload.referenceId));

  await db
    .update(clientPings)
    .set({ status: "responded", responseAt: new Date() })
    .where(eq(clientPings.id, payload.pingId));

  // Notify builders
  await notifyBuilders(payload.projectId, {
    reviewerName,
    reviewerEmail,
    itemTitle: `${req.refCode} — ${req.title}`,
    itemType: "requirement",
    decision,
    comment,
    scopeCreepDetected,
  });

  redirect(`/review/${token}?done=1&decision=${decision}`);
}

export async function submitDemoReview(
  token: string,
  decision: "approved" | "rejected",
  formData: FormData
) {
  const payload = verifyReviewToken(token);
  if (!payload || payload.type !== "demo")
    redirect(`/review/${token}?error=invalid`);

  const reviewerName = ((formData.get("reviewerName") as string) ?? "").trim();
  const comment = ((formData.get("comment") as string) ?? "").trim() || null;
  const reviewerEmail = payload.reviewerEmail;

  if (!reviewerName) redirect(`/review/${token}?error=name_required`);

  const [demo] = await db
    .select()
    .from(demoVideos)
    .where(eq(demoVideos.id, payload.referenceId))
    .limit(1);

  if (!demo) redirect(`/review/${token}?error=invalid`);

  // Scope creep check on rejections with a linked requirement
  let scopeCreepDetected = false;
  let scopeCreepSummary: string | undefined;

  if (decision === "rejected" && comment && demo.requirementId) {
    const [req] = await db
      .select({ title: requirements.title, description: requirements.description })
      .from(requirements)
      .where(eq(requirements.id, demo.requirementId))
      .limit(1);

    if (req) {
      try {
        const result = await detectScopeCreep(req.title, req.description, comment);
        scopeCreepDetected = result.detected;
        scopeCreepSummary = result.summary ?? undefined;

        if (result.detected && result.title && result.description) {
          await db.insert(scopeChanges).values({
            projectId: payload.projectId,
            title: result.title,
            description: result.description,
            source: "client_request",
            sourceDetail: `Auto-detected from ${reviewerName} (${reviewerEmail}) rejection of demo: ${demo.title}`,
            impactDescription: "Impact to be assessed by the team.",
            status: "pending",
          });
        }
      } catch {
        // Don't fail the review submission if AI detection errors
      }
    }
  }

  await db.insert(clientReviews).values({
    projectId: payload.projectId,
    pingId: payload.pingId,
    demoVideoId: demo.id,
    reviewerName,
    reviewerEmail,
    decision,
    comment,
    scopeCreepDetected,
    scopeCreepSummary: scopeCreepSummary ?? null,
  });

  await db
    .update(demoVideos)
    .set({
      clientStatus: decision,
      clientResponseAt: new Date(),
      clientComment: comment,
      updatedAt: new Date(),
    })
    .where(eq(demoVideos.id, payload.referenceId));

  await db
    .update(clientPings)
    .set({ status: "responded", responseAt: new Date() })
    .where(eq(clientPings.id, payload.pingId));

  await notifyBuilders(payload.projectId, {
    reviewerName,
    reviewerEmail,
    itemTitle: demo.title,
    itemType: "demo",
    decision,
    comment,
    scopeCreepDetected,
  });

  redirect(`/review/${token}?done=1&decision=${decision}`);
}
