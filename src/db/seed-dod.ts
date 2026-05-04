import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import { tasks, dodItems } from "./schema";
import { eq } from "drizzle-orm";

const criterionMap: Record<string, string> = {
  "PLT-01": "Platform nav renders all 10 modules; invitation links functional; org data isolation validated",
  "RSK-01": "Risk creation flow works end-to-end; AI risk scenario generation functional",
  "RSK-02": "Inherent Risk auto-calc (Likelihood × Impact) correct; Control Effectiveness + Residual Risk calculated",
  "RSK-03": "Risk status auto-transitions: Open → Ongoing → Closed on control implementation",
  "RSK-04": "Evidence upload with Admin accept/decline; status reverts correctly on decline",
  "EVD-01": "Evidence upload reliable; mandatory fields enforced (Title, File, Framework, Control Ref); lifecycle (In Review → Approved / Rejected / Expired) functional",
  "EVD-02": "Evidence rejection requires mandatory reason; client notified on rejection",
  "EVD-03": "Many-to-many evidence linking: one evidence item maps to multiple controls",
  "EVD-04": "Evidence version history: new uploads tracked as versions of prior evidence",
  "EVD-05": "Evidence expiry notifications sent at 30 days and 7 days; auto-transition on expiry",
  "GAP-01": "Gap Tracker: manual creation, full lifecycle (Open → Closed); closure blocked without approved evidence",
  "GAP-02": "Bulk gap import functional; gaps auto-imported from completed assessments",
  "GAP-04": "Gap-to-risk escalation: bidirectional link between gap and risk register",
  "GAP-05": "Auto-close gap on accepted evidence (PCI DSS path); Gap Remediation reports export as PDF/Excel",
  "POL-01": "Policy Maker: Analyse Existing Policy flow (upload → AI gap analysis) functional",
  "POL-02": "Policy Maker: Regenerate Section (AI rewrite per identified gap) functional",
  "POL-03": "Policy Maker: Create New Policy wizard functional end-to-end",
  "POL-04": "Policy lifecycle enforced: Draft → Review → Approval → Active → Retired",
  "ASM-01": "Assessment creation works across all 6 supported standards",
  "ASM-02": "Audit domain management: evidence upload per clause/control; accept/reject with mandatory comments",
  "ASM-03": "Skip and backward navigation between audit domains functional",
  "DSH-01": "Dashboard aggregates real metrics from all modules; metric cards are clickable with drill-down",
  "DSH-02": "Dashboard Action Required panel shows pending items across all modules",
  "DSH-03": "Dashboard PDF report generation functional",
  "ISO-01": "ISO 27001: full standard structure loaded with correct navigation",
  "ISO-02": "ISO 27001: Statement of Applicability (SoA) auto-generated and exportable",
  "ISO-03": "ISO 27001: traceability chain implemented bidirectionally (control ↔ evidence ↔ gap)",
  "PCI-01": "PCI DSS: all Requirements 1-12 with sub-requirements (v4.0.1) loaded correctly",
  "PCI-02": "PCI DSS: evidence mapped per sub-requirement; N/A designation supported",
  "PCI-04": "PCI DSS: Client Admin role enforced — approve/reject only, no upload permissions",
  "SMS-01": "ISO 20000 (SMS): standard structure loaded; Service Portfolio and Catalogue functional",
  "BCM-01": "ISO 22301 (BCMS): standard structure loaded; BIA and BCP coverage functional",
  "PIA-01": "ISO 27701 (PIMS): standard structure loaded; PIA full lifecycle functional",
  "ROPA-01": "NDPA: ROPA module functional with complete 28-field schema",
  "TRD-01": "Trend Analysis: compliance score trending and charts render correctly",
  "TRD-02": "Trend Analysis: KPIs dashboard and heatmap functional",
};

async function seedDod() {
  console.log("Seeding DoD items for proj_de_grc...");

  const projectId = "proj_de_grc";

  const allTasks = await db
    .select({
      id: tasks.id,
      refCode: tasks.refCode,
      requirementId: tasks.requirementId,
      dodRef: tasks.dodRef,
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  const tasksWithDod = allTasks.filter(
    (t) => t.dodRef && t.dodRef.trim() !== "" && t.requirementId
  );

  // Deduplicate: one dod_item per unique (dodRef, requirementId)
  const seen = new Set<string>();
  const dodToInsert: {
    projectId: string;
    requirementId: string;
    dodRef: string;
    criterion: string;
    taskId: string;
  }[] = [];

  for (const t of tasksWithDod) {
    const key = `${t.dodRef}::${t.requirementId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const criterion = criterionMap[t.dodRef!] ?? t.dodRef!;
    dodToInsert.push({
      projectId,
      requirementId: t.requirementId!,
      dodRef: t.dodRef!,
      criterion,
      taskId: t.id,
    });
  }

  if (dodToInsert.length === 0) {
    console.log("  No DoD items to insert.");
    return;
  }

  await db.insert(dodItems).values(dodToInsert).onConflictDoNothing();
  console.log(`  ✓ ${dodToInsert.length} DoD items inserted`);

  const byReq = dodToInsert.reduce<Record<string, number>>((acc, d) => {
    acc[d.dodRef] = (acc[d.dodRef] ?? 0) + 1;
    return acc;
  }, {});
  for (const [ref, count] of Object.entries(byReq)) {
    console.log(`    ${ref}: ${count}`);
  }
}

seedDod().catch(console.error);
