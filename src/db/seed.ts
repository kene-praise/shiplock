import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import {
  organizations,
  users,
  projects,
  requirements,
  tasks,
  scopeChanges,
  standups,
  clientPings,
} from "./schema";

async function seed() {
  console.log("Seeding ShipLock database...");

  // ── Org ──────────────────────────────────────────────────────────────────────
  const [org] = await db
    .insert(organizations)
    .values({ id: "org_shiplock", name: "ShipLock", slug: "shiplock" })
    .onConflictDoNothing()
    .returning();
  const orgId = org?.id ?? "org_shiplock";
  console.log("  ✓ Organization");

  // ── Users ────────────────────────────────────────────────────────────────────
  const [builder] = await db
    .insert(users)
    .values({
      id: "user_kene",
      orgId,
      email: "kene@shiplock.dev",
      name: "Kene",
      role: "owner",
    })
    .onConflictDoNothing()
    .returning();
  const builderId = builder?.id ?? "user_kene";

  await db
    .insert(users)
    .values({
      id: "user_client_grc",
      orgId,
      email: "praiseofumaduadike@gmail.com",
      name: "Digital Encode",
      role: "client",
    })
    .onConflictDoNothing();
  console.log("  ✓ Users");

  // ── Project ──────────────────────────────────────────────────────────────────
  const [project] = await db
    .insert(projects)
    .values({
      id: "proj_grc",
      orgId,
      name: "Digital Encode GRC",
      description: "Governance, Risk & Compliance platform for Digital Encode",
      status: "active",
      mvpDeadline: "2025-06-30",
    })
    .onConflictDoNothing()
    .returning();
  const projectId = project?.id ?? "proj_grc";
  console.log("  ✓ Project");

  // ── Requirements ─────────────────────────────────────────────────────────────
  const reqs = await db
    .insert(requirements)
    .values([
      {
        projectId,
        refCode: "REQ-001",
        title: "User authentication and role-based access control",
        description: "System must support login via email/password with roles: Admin, Analyst, Viewer.",
        source: "document",
        sourceDetail: "GRC requirements doc v1.2",
        classification: "mvp",
        status: "approved",
        clientApprovedAt: new Date("2025-04-01"),
      },
      {
        projectId,
        refCode: "REQ-002",
        title: "Risk register with CRUD operations",
        description: "Users can create, view, update, and delete risk entries with severity scoring.",
        source: "meeting",
        sourceDetail: "Kickoff call 2025-03-15",
        classification: "mvp",
        status: "approved",
        clientApprovedAt: new Date("2025-04-01"),
      },
      {
        projectId,
        refCode: "REQ-003",
        title: "Compliance framework mapping (ISO 27001 + NDPR)",
        description: "Map controls to ISO 27001 Annex A and NDPR requirements with gap analysis.",
        source: "document",
        sourceDetail: "GRC requirements doc v1.2",
        classification: "mvp",
        status: "pending_approval",
        autoApproveDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        projectId,
        refCode: "REQ-004",
        title: "Automated PDF report generation",
        description: "Generate board-ready PDF reports from risk register and compliance status.",
        source: "email",
        sourceDetail: "Email from CEO 2025-03-22",
        classification: "post_mvp",
        status: "draft",
      },
      {
        projectId,
        refCode: "REQ-005",
        title: "Third-party vendor risk assessment module",
        description: "Questionnaire-based vendor risk scoring with automated follow-up.",
        source: "meeting",
        sourceDetail: "Discovery call 2025-03-20",
        classification: "post_mvp",
        status: "draft",
      },
    ])
    .onConflictDoNothing()
    .returning();
  const [req1, req2, req3] = reqs;
  console.log("  ✓ Requirements");

  // ── Tasks ────────────────────────────────────────────────────────────────────
  await db
    .insert(tasks)
    .values([
      {
        projectId,
        requirementId: req1?.id,
        refCode: "T-001",
        title: "Set up Better Auth with email/password",
        ownerId: builderId,
        priority: "p0_critical",
        status: "done",
        week: "W1",
        completedAt: new Date("2025-04-05"),
      },
      {
        projectId,
        requirementId: req1?.id,
        refCode: "T-002",
        title: "Implement RBAC middleware (Admin / Analyst / Viewer)",
        ownerId: builderId,
        priority: "p0_critical",
        status: "done",
        week: "W1",
        completedAt: new Date("2025-04-07"),
      },
      {
        projectId,
        requirementId: req2?.id,
        refCode: "T-003",
        title: "Risk register data model + API routes",
        ownerId: builderId,
        priority: "p1_high",
        status: "done",
        week: "W2",
        completedAt: new Date("2025-04-12"),
      },
      {
        projectId,
        requirementId: req2?.id,
        refCode: "T-004",
        title: "Risk register UI — list + detail views",
        ownerId: builderId,
        priority: "p1_high",
        status: "in_progress",
        week: "W2",
        startedAt: new Date("2025-04-13"),
      },
      {
        projectId,
        requirementId: req3?.id,
        refCode: "T-005",
        title: "ISO 27001 controls mapping schema",
        ownerId: builderId,
        priority: "p1_high",
        status: "in_progress",
        week: "W3",
        startedAt: new Date("2025-04-15"),
      },
      {
        projectId,
        requirementId: req3?.id,
        refCode: "T-006",
        title: "NDPR compliance checklist UI",
        ownerId: builderId,
        priority: "p2_medium",
        status: "not_started",
        week: "W3",
      },
      {
        projectId,
        refCode: "T-007",
        title: "Dashboard overview page",
        ownerId: builderId,
        priority: "p1_high",
        status: "blocked",
        week: "W2",
        blockedBy: "Client",
        blockedReason: "Waiting on client to confirm KPI metrics to display on dashboard",
        startedAt: new Date("2025-04-11"),
      },
      {
        projectId,
        refCode: "T-008",
        title: "Email notification system",
        ownerId: builderId,
        priority: "p2_medium",
        status: "not_started",
        week: "W4",
      },
    ])
    .onConflictDoNothing();
  console.log("  ✓ Tasks");

  // ── Scope changes ─────────────────────────────────────────────────────────────
  await db
    .insert(scopeChanges)
    .values([
      {
        projectId,
        title: "Add multi-language support (English + French)",
        description: "Client requested the platform UI be available in both English and French.",
        source: "client_request",
        sourceDetail: "WhatsApp message from CEO, 2025-04-08",
        impactDescription: "Estimated +5 days: i18n setup, translation of all UI strings, language switcher.",
        estimatedDays: 5,
        status: "pending",
      },
      {
        projectId,
        title: "Integration with existing Active Directory",
        description: "SSO login via existing company Active Directory instead of email/password only.",
        source: "meeting",
        sourceDetail: "Week 2 review call",
        impactDescription: "Estimated +3 days: LDAP/SAML integration, session handling changes.",
        estimatedDays: 3,
        status: "accepted",
        acknowledgedBy: "user_client_grc",
        acknowledgedAt: new Date("2025-04-10"),
      },
    ])
    .onConflictDoNothing();
  console.log("  ✓ Scope changes");

  // ── Standups ──────────────────────────────────────────────────────────────────
  await db
    .insert(standups)
    .values([
      {
        projectId,
        userId: builderId,
        date: "2025-04-14",
        didYesterday: "Finished risk register API routes, wrote tests for CRUD operations.",
        doingToday: "Starting the risk register list UI, wireframe already reviewed.",
        blockers: null,
      },
      {
        projectId,
        userId: builderId,
        date: "2025-04-15",
        didYesterday: "Risk register list view done. Started ISO controls mapping schema.",
        doingToday: "Finishing ISO 27001 schema, then starting NDPR checklist data model.",
        blockers: "Waiting on client confirmation of dashboard KPIs before starting that page.",
      },
    ])
    .onConflictDoNothing();
  console.log("  ✓ Standups");

  // ── Client pings ──────────────────────────────────────────────────────────────
  await db
    .insert(clientPings)
    .values([
      {
        projectId,
        type: "requirement_review",
        referenceType: "requirement",
        sentAt: new Date("2025-04-14T09:00:00"),
        deadline: new Date("2025-04-16T09:00:00"),
        status: "pending",
      },
      {
        projectId,
        type: "feedback_request",
        referenceType: "general",
        sentAt: new Date("2025-04-10T09:00:00"),
        deadline: new Date("2025-04-12T09:00:00"),
        responseAt: new Date("2025-04-11T14:30:00"),
        status: "responded",
      },
    ])
    .onConflictDoNothing();
  console.log("  ✓ Client pings");

  console.log("\nSeed complete.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
