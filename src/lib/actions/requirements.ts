"use server";

import { db } from "@/db";
import { requirements, clientPings, users, projects, auditLogs, tasks, demoVideos, clientReviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signReviewToken } from "@/lib/signed-url";
import { sendRequirementReviewEmail } from "@/lib/email";
import { requireBuilder, requireProjectInOrg } from "./guard";
import { callAI } from "@/lib/ai";

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

export async function importRequirementsWithAI(
  projectId: string,
  org: string,
  project: string,
  formData: FormData
) {
  const member = await requireBuilder(org);
  await requireProjectInOrg(projectId, member.orgId);

  const documentText = (formData.get("documentText") as string)?.trim();
  if (!documentText) return;

  const prompt = `You are an expert project manager and system architect.
Analyze the following project documentation or text and extract clean, specific requirements and their associated implementation tasks.

Project document:
"""
${documentText}
"""

Instructions:
1. Extract requirements that need client approval and tasks that builders need to complete.
2. Group tasks under their respective requirements by referencing a temporary "refId" (e.g. "REQ_1", "REQ_2"). If a task doesn't map to a specific requirement, do not link it.
3. Classification of requirements should be one of: "mvp", "post_mvp", "out_of_scope".
4. Source of requirements should be "document".
5. Priority of tasks should be one of: "p0_critical", "p1_high", "p2_medium", "p3_low".
6. Respond with JSON only, matching this schema:
{
  "requirements": [
    {
      "refId": "REQ_1",
      "title": "Short title",
      "description": "Full details of the requirement",
      "classification": "mvp"
    }
  ],
  "tasks": [
    {
      "reqRefId": "REQ_1",
      "title": "Task title",
      "description": "Optional task details",
      "priority": "p2_medium"
    }
  ]
}`;

  const aiResponse = await callAI(prompt);

  // Clean JSON response (in case of markdown blocks)
  const cleaned = aiResponse.replace(/```json\s*/i, "").replace(/```\s*$/, "").trim();
  type ParsedImport = {
    requirements: {
      refId: string;
      title: string;
      description: string;
      classification: string;
    }[];
    tasks: {
      reqRefId: string | null;
      title: string;
      description: string | null;
      priority: string;
    }[];
  };
  let parsed: ParsedImport;
  try {
    parsed = JSON.parse(cleaned) as ParsedImport;
  } catch {
    throw new Error("The AI returned a response that couldn't be parsed. Try the import again.");
  }
  const parsedReqs = Array.isArray(parsed.requirements) ? parsed.requirements : [];
  const parsedTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
  if (parsedReqs.length === 0 && parsedTasks.length === 0) return;

  // 1. Insert requirements in one statement (neon-http has no transactions —
  // batching keeps a failure from leaving a half-written import)
  const reqIdMap = new Map<string, string>(); // temp refId -> db UUID

  // Get starting REQ number
  const existingReqs = await db
    .select({ refCode: requirements.refCode })
    .from(requirements)
    .where(eq(requirements.projectId, projectId));
  let maxReqNum = existingReqs.reduce((m, r) => {
    const n = parseInt(r.refCode.replace("REQ-", ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);

  if (parsedReqs.length > 0) {
    const inserted = await db
      .insert(requirements)
      .values(
        parsedReqs.map((r, i) => ({
          projectId,
          refCode: `REQ-${String(maxReqNum + i + 1).padStart(3, "0")}`,
          title: r.title,
          description: r.description,
          source: "document" as const,
          classification: (r.classification || "mvp") as "mvp" | "post_mvp" | "out_of_scope",
          status: "draft" as const,
        }))
      )
      .returning({ id: requirements.id });
    inserted.forEach((row, i) => reqIdMap.set(parsedReqs[i].refId, row.id));
    maxReqNum += parsedReqs.length;
  }

  // 2. Insert tasks in one statement
  if (parsedTasks.length > 0) {
    const existingTasks = await db
      .select({ refCode: tasks.refCode })
      .from(tasks)
      .where(eq(tasks.projectId, projectId));
    const maxTaskNum = existingTasks.reduce((m, t) => {
      const n = parseInt(t.refCode.replace("T-", ""), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);

    await db.insert(tasks).values(
      parsedTasks.map((t, i) => ({
        projectId,
        refCode: `T-${String(maxTaskNum + i + 1).padStart(3, "0")}`,
        title: t.title,
        description: t.description || null,
        ownerId: member.user.id,
        priority: (t.priority || "p2_medium") as "p0_critical" | "p1_high" | "p2_medium" | "p3_low",
        status: "not_started" as const,
        requirementId: (t.reqRefId ? reqIdMap.get(t.reqRefId) : null) || null,
      }))
    );
  }

  revalidatePath(`/${org}/${project}/requirements`);
  revalidatePath(`/${org}/${project}/tasks`);
  redirect(`/${org}/${project}/requirements`);
}

export async function updateRequirement(
  id: string,
  org: string,
  project: string,
  formData: FormData
) {
  const member = await requireBuilder(org);
  
  const [oldReq] = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, id))
    .limit(1);
  
  if (!oldReq) throw new Error("Not found");
  await requireProjectInOrg(oldReq.projectId, member.orgId);

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const classification = formData.get("classification") as string;
  const source = formData.get("source") as string;
  const sourceDetail = (formData.get("sourceDetail") as string)?.trim() || null;
  const status = formData.get("status") as string;

  if (!title || !description) return;

  const [newReq] = await db
    .update(requirements)
    .set({
      title,
      description,
      classification: classification as "mvp" | "post_mvp" | "out_of_scope",
      source: source as "document" | "meeting" | "email" | "verbal",
      sourceDetail,
      status: status as "draft" | "pending_approval" | "approved" | "disputed",
      updatedAt: new Date(),
    })
    .where(eq(requirements.id, id))
    .returning();

  // Insert audit log
  await db.insert(auditLogs).values({
    projectId: oldReq.projectId,
    userId: member.user.id,
    action: "updated",
    entityType: "requirement",
    entityId: id,
    oldValue: oldReq,
    newValue: newReq,
  });

  revalidatePath(`/${org}/${project}/requirements`);
}
