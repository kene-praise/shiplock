"use server";

import { db } from "@/db";
import { requirements, clientPings, users, projects, auditLogs, tasks, demoVideos, clientReviews } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signReviewToken } from "@/lib/signed-url";
import { sendRequirementReviewEmail } from "@/lib/email";
import { requireBuilder, requireProjectInOrg } from "./guard";
import { callAI, AIUnavailableError } from "@/lib/ai";
import type { ImportState } from "./requirements.types";
import type { FormState } from "./form-state";

// AI import runs on a shared (free-tier) provider key, so cap how many times a
// single user can trigger it per rolling 24h — one abusive loop shouldn't be
// able to exhaust the daily quota for everyone.
const MAX_IMPORTS_PER_DAY = 10;

const normTitle = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

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
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const member = await requireBuilder(org);
  await requireProjectInOrg(projectId, member.orgId);

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const source = (formData.get("source") as string) || "meeting";
  const sourceDetail = (formData.get("sourceDetail") as string)?.trim() || null;
  const classification = (formData.get("classification") as string) || "mvp";

  if (!title || !description) return { error: "Title and description are required." };

  const existing = await db
    .select({ id: requirements.id, title: requirements.title })
    .from(requirements)
    .where(eq(requirements.projectId, projectId));
  const duplicate = existing.find((r) => normTitle(r.title) === normTitle(title));
  if (duplicate) {
    redirect(`/${org}/${project}/requirements?requirement=${duplicate.id}`);
  }

  const refCode = await nextRefCode(projectId);

  const [newRow] = await db
    .insert(requirements)
    .values({
      projectId,
      refCode,
      title,
      description,
      source: source as "document" | "meeting" | "email" | "verbal",
      sourceDetail,
      classification: classification as "mvp" | "post_mvp" | "out_of_scope",
      status: "draft",
    })
    .returning();

  await db.insert(auditLogs).values({
    projectId,
    userId: member.user.id,
    action: "created",
    entityType: "requirement",
    entityId: newRow.id,
    newValue: newRow,
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

  // neon-http has no transactions — db.batch runs all statements atomically in a
  // single request so a mid-sequence failure can't leave partial state. Clear
  // foreign-key references first, log the audit, delete the primary row last.
  await db.batch([
    db.update(tasks).set({ requirementId: null }).where(eq(tasks.requirementId, requirementId)),
    db.update(demoVideos).set({ requirementId: null }).where(eq(demoVideos.requirementId, requirementId)),
    db.delete(clientReviews).where(eq(clientReviews.requirementId, requirementId)),
    db.insert(auditLogs).values({
      projectId: req.projectId,
      userId: member.user.id,
      action: "deleted",
      entityType: "requirement",
      entityId: req.id as string,
      oldValue: req,
    }),
    db.delete(requirements).where(eq(requirements.id, requirementId)),
  ]);

  revalidatePath(`/${org}/${project}/requirements`);
  redirect(`/${org}/${project}/requirements`);
}

export async function importRequirementsWithAI(
  projectId: string,
  org: string,
  project: string,
  _prevState: ImportState,
  formData: FormData
): Promise<ImportState> {
  const member = await requireBuilder(org);
  await requireProjectInOrg(projectId, member.orgId);

  const documentText = (formData.get("documentText") as string)?.trim();
  if (!documentText) return { error: "Paste a document or upload a file to import." };

  // Rate limit: count this user's imports in the last 24h before spending quota.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentImports = await db
    .select({ id: auditLogs.id })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.userId, member.user.id),
        eq(auditLogs.action, "ai_import"),
        gte(auditLogs.createdAt, since)
      )
    );
  if (recentImports.length >= MAX_IMPORTS_PER_DAY) {
    return {
      error: `You've reached the daily limit of ${MAX_IMPORTS_PER_DAY} AI imports. Please try again later.`,
    };
  }

  // Record the attempt up front — a request that reaches the provider counts
  // against quota whether or not it ultimately succeeds.
  await db.insert(auditLogs).values({
    projectId,
    userId: member.user.id,
    action: "ai_import",
    entityType: "ai_import",
    entityId: crypto.randomUUID(),
    metadata: { documentChars: documentText.length },
  });

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

  let aiResponse: string;
  try {
    aiResponse = await callAI(prompt);
  } catch (e) {
    if (e instanceof AIUnavailableError) return { error: e.message };
    throw e;
  }

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
    return { error: "The AI returned an unreadable response. Please try the import again." };
  }
  const parsedReqs = Array.isArray(parsed.requirements) ? parsed.requirements : [];
  const parsedTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
  if (parsedReqs.length === 0 && parsedTasks.length === 0) {
    return { error: "The AI couldn't find any requirements or tasks in that text." };
  }

  // 1. Insert requirements in one statement (neon-http has no transactions —
  // batching keeps a failure from leaving a half-written import)
  const reqIdMap = new Map<string, string>(); // temp refId -> db UUID

  // Get starting REQ number + existing titles for dedupe
  const existingReqs = await db
    .select({ id: requirements.id, refCode: requirements.refCode, title: requirements.title })
    .from(requirements)
    .where(eq(requirements.projectId, projectId));
  let maxReqNum = existingReqs.reduce((m, r) => {
    const n = parseInt(r.refCode.replace("REQ-", ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 0);

  // Map normalized title -> existing/earlier requirement id, so duplicates
  // (against the project or within this same batch) reuse the existing row.
  const titleToId = new Map<string, string>();
  existingReqs.forEach((r) => titleToId.set(normTitle(r.title), r.id));

  // refIds seen earlier in this batch, keyed by normalized title, so a repeat
  // title within the same import resolves to the first occurrence's refId.
  const batchTitleToRefId = new Map<string, string>();
  const newReqs: typeof parsedReqs = [];
  const dupRefIds: { refId: string; key: string }[] = [];
  for (const r of parsedReqs) {
    const key = normTitle(r.title);
    const existingId = titleToId.get(key);
    const earlierRefId = batchTitleToRefId.get(key);
    if (existingId) {
      reqIdMap.set(r.refId, existingId);
    } else if (earlierRefId) {
      // Points at an earlier new req in this batch — resolve after insert.
      dupRefIds.push({ refId: r.refId, key });
    } else {
      batchTitleToRefId.set(key, r.refId);
      newReqs.push(r);
    }
  }

  if (newReqs.length > 0) {
    const inserted = await db
      .insert(requirements)
      .values(
        newReqs.map((r, i) => ({
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
    inserted.forEach((row, i) => {
      reqIdMap.set(newReqs[i].refId, row.id);
      titleToId.set(normTitle(newReqs[i].title), row.id);
    });
    maxReqNum += newReqs.length;
  }

  // Resolve within-batch duplicates to the first occurrence's inserted id.
  for (const d of dupRefIds) {
    const firstRefId = batchTitleToRefId.get(d.key);
    const resolved = firstRefId ? reqIdMap.get(firstRefId) : undefined;
    if (resolved) reqIdMap.set(d.refId, resolved);
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
