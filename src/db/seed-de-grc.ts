import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import {
  users,
  projects,
  requirements,
  tasks,
  scopeChanges,
  standups,
} from "./schema";

// ── Adapted to existing org_shiplock ──────────────────────────────────────────
const ORG_ID = "org_shiplock";
const PROJECT_ID = "proj_de_grc";

const NEW_USERS = [
  {
    id: "user_vello",
    orgId: ORG_ID,
    email: "vello@v1.studio",
    name: "Vello",
    role: "owner" as const,
  },
  {
    id: "user_engineer",
    orgId: ORG_ID,
    email: "engineer@v1.studio",
    name: "Engineer",
    role: "builder" as const,
  },
  {
    id: "user_ify",
    orgId: ORG_ID,
    email: "ify@digitalencode.net",
    name: "Ify (DE Liaison)",
    role: "client" as const,
  },
  {
    id: "user_profwale",
    orgId: ORG_ID,
    email: "profwale@digitalencode.net",
    name: "Prof Wale (DE Exec)",
    role: "client" as const,
  },
];

const PROJECT = {
  id: PROJECT_ID,
  orgId: ORG_ID,
  name: "Digital Encode GRC Automation Tool",
  description:
    "Compliance platform covering ISMS (ISO 27001), PCI DSS, BCMS (ISO 22301), SMS (ISO 20000-1), PIMS (ISO 27701), and NDPA. Competitors: Vanta, Drata. App structure: Client → Project/Standard → Phase → Document.",
  status: "active" as const,
  mvpDeadline: "2026-06-01",
};

// ── Requirements — all 31, extracted from 40-page consolidated requirements doc ──
const REQUIREMENTS_DATA = [
  // ── PLATFORM STRUCTURE ──
  {
    refCode: "REQ-001",
    title: "Persistent left navigation with all 10 modules",
    description:
      "The system shall provide a client compliance portal with a persistent left navigation menu containing: Dashboard, Assets, Projects, Assessments, Risk Register, Gap Tracker, Evidence Library, Policy Maker, Team Management, Settings. All modules accessible at all times.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.2 — Platform Structure",
  },
  {
    refCode: "REQ-002",
    title: "Organization-specific data display + seamless navigation",
    description:
      "All modules shall display organization-specific data and support seamless navigation between related compliance workflows.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.2 — Platform Structure",
  },

  // ── DASHBOARD MODULE ──
  {
    refCode: "REQ-003",
    title: "Centralized real-time compliance dashboard",
    description:
      "The system shall provide a centralized, real-time compliance overview by aggregating data from Projects, Assessments, Risks, Gaps, Evidence, and Assets. Display key metrics: Active Projects, Open Risks, Open Gaps, Pending Reviews (clickable with drill-down).",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.2 — Dashboard Module",
  },
  {
    refCode: "REQ-004",
    title: "Dashboard sub-metrics and reporting",
    description:
      "Show project health (failed controls, missing evidence, completion %), risk exposure breakdown (H/M/L), gap status (open, critical, overdue, in progress, closed), evidence lifecycle (uploaded, pending, approved, rejected, expiring), asset summary (total, critical, unassigned). Action Required panel. PDF report generation. System alerts and notifications. Real-time updates.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.2 — Dashboard Module",
  },

  // ── ASSETS MODULE ──
  {
    refCode: "REQ-005",
    title: "End-to-end asset lifecycle management",
    description:
      "CRUD + bulk import assets. Detailed attributes (name, type, owner, dept, classification, status, location). Asset types: Hardware, Software, Applications, Databases, Cloud, Information, People + configurable. Mandatory fields, ownership from Team Mgmt, classification levels (Public, Internal, Confidential, Restricted). Search, filter, sort. Audit logs with timestamps and change history. Bulk upload validation.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.2-3 — Assets Module",
  },

  // ── PROJECTS MODULE ──
  {
    refCode: "REQ-006",
    title: "Centralized project management dashboard",
    description:
      "Centralized dashboard with summary metrics (Total, In Progress, Completed, Planned, On-Hold) with drill-down. Status-based tabs. IMS project grouping (multiple frameworks under single project). Lifecycle visibility (Planned→In Progress→Completed→On-Hold). Hierarchical navigation. Search, filter, sort, pagination.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.3-5 — Projects Module",
  },
  {
    refCode: "REQ-007",
    title: "Project detail dashboard with documentation and evidence",
    description:
      "Project detail page: general info, planning, timelines, documentation, evidence management, gap assessment management. Completed project deep-structure (Phase 1-4 documents, Evidence Repository, External Audit, Comments). Documentation Repository aligned to ISO structure. DOCX editing in-platform. Progress Metrics (Total Controls, Implemented, Completion %, AI Health Score). Workflow & Ownership with admin assignment and feedback loop.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.4-5 — Projects Module",
  },
  {
    refCode: "REQ-008",
    title: "Recycle Bin functionality for projects/tasks",
    description:
      "Introduce Recycle Bin functionality to restore or permanently delete removed projects or tasks. Maintain a full audit history of all deletions and restorations.",
    classification: "post_mvp" as const,
    source: "document" as const,
    sourceDetail:
      "Client Requirements Doc p.4 — DEFERRED: Nice-to-have, soft-delete sufficient for MVP",
  },
  {
    refCode: "REQ-009",
    title: "Gantt-style timeline and milestone tracking",
    description:
      "Auto-generate a visual Gantt-style timeline from project plan data. Display phase-based milestone tracking and dependencies. Project Plan Management (standard task structure, dynamic modification, version tracking, link to milestones).",
    classification: "post_mvp" as const,
    source: "document" as const,
    sourceDetail:
      "Client Requirements Doc p.4-5 — DEFERRED: Requires dedicated charting library, 2-3 weeks alone. Manual project plan uploads serve MVP.",
  },

  // ── ASSESSMENT MODULE ──
  {
    refCode: "REQ-010",
    title: "Multi-standard assessment module",
    description:
      "Centralized dashboard (Total, In Progress, Awaiting Review, Completed). Assessment creation across ISO 27001, ISO 22301, ISO 27701, ISO 20000, NDPA/GAID, PCI DSS. Audit Domain Management with per-clause evidence upload, Evidence Library linking, justification statements. Accept/reject evidence with comments. Reviewer handle repeated evidence. Multiple uploads per clause. Skip/backward navigation.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.6 — Assessment Module",
  },

  // ── RISK MODULE ──
  {
    refCode: "REQ-011",
    title: "Full risk management module",
    description:
      "Dashboard (Total, Open, In Progress, Resolved). Risk Log with AI-assisted generation. Inherent Risk = Likelihood × Impact. Control Effectiveness rating (Achieved/Mostly/Partially/Not Achieved). Residual Risk = Inherent × (100% - Control Effectiveness). Treatment actions with timelines and personnel. Auto status change (Open→Ongoing→Closed). Mandatory evidence upload. Admin accept/decline with status revert.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.6-7 — Risk Module",
  },

  // ── GAP TRACKER MODULE ──
  {
    refCode: "REQ-012",
    title: "Gap lifecycle management",
    description:
      "Summary metrics (Total, Open, In Progress, Pending Review, Closed, Overdue) clickable. Lifecycle: Open→In Progress→Pending Review→Closed. Closure requires approved Evidence Library item. Manual creation + bulk import (CSV/XLSX). Auto-import from assessments. Priority (H/M/L), Assigned Owner, Due Date enforcement. Gap-to-risk escalation (bidirectional). Duplicate detection. Filtering. Remediation Reports (PDF/Excel).",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.7-8 — Gap Tracker Module",
  },
  {
    refCode: "REQ-013",
    title: "Saved filter presets for Gap Tracker",
    description: "Support saved filter presets in the Gap Tracker module.",
    classification: "post_mvp" as const,
    source: "document" as const,
    sourceDetail:
      "Client Requirements Doc p.8 — DEFERRED: UX enhancement, not compliance requirement",
  },

  // ── EVIDENCE LIBRARY MODULE ──
  {
    refCode: "REQ-014",
    title: "Evidence lifecycle management",
    description:
      "Summary metrics (Total, Approved, In Review, Rejected, Expiring Soon) clickable. Lifecycle: In Review→Approved/Rejected/Expired. Mandatory fields at upload. Many-to-many framework linking. Auto-assign In Review. Mandatory rejection reason + notification. Threaded comments. Version history. Expiry notifications (30d + 7d). Audit trail. Filtering. Policy Maker linkage.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.8-9 — Evidence Library Module",
  },

  // ── POLICY MAKER MODULE ──
  {
    refCode: "REQ-015",
    title: "AI-driven policy analysis and generation",
    description:
      "Two entry points: Analyse Existing Policy + Create New Policy. Upload PDF/DOCX for AI gap analysis. Gap results by control/requirement with severity tags. Regenerate Section (AI rewrite per gap). Mark Not Applicable. Compliance score recalculation (pre/post). Create New Policy wizard with all frameworks. Organizational context. Policy lifecycle (Draft→Under Review→Pending Approval→Approved→Retired). Review and approval workflow. Search, Resume vs View Report, Analysis History filters. Export PDF/DOCX.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.9-10 — Policy Maker Module",
  },
  {
    refCode: "REQ-016",
    title: "Policy version history grouped under one record",
    description:
      "Maintain version history per policy; multiple analyses or rewrites grouped under one record with version timeline.",
    classification: "post_mvp" as const,
    source: "document" as const,
    sourceDetail:
      "Client Requirements Doc p.10 — DEFERRED: Requires data model rewrite. Policy Maker currently standalone.",
  },
  {
    refCode: "REQ-017",
    title: "Link approved policies to Evidence Library",
    description:
      "Allow approved policies to be linked directly to the Evidence Library as evidence against controls.",
    classification: "post_mvp" as const,
    source: "document" as const,
    sourceDetail:
      "Client Requirements Doc p.10 — DEFERRED: Cross-module linking requires shared data contracts. Manual upload as workaround.",
  },

  // ── THIRD PARTY MODULE ──
  {
    refCode: "REQ-018",
    title: "Third Party Module (entire)",
    description:
      "Full vendor lifecycle: onboarding, classification, due diligence, risk assessment, contract/compliance management, access mapping, continuous monitoring, issue tracking, offboarding, reporting.",
    classification: "post_mvp" as const,
    source: "document" as const,
    sourceDetail:
      "Client Requirements Doc p.11-12 — DEFERRED: Standalone product-level feature requiring 6-8 weeks. New domain concepts. Track manually via Risk Register.",
  },

  // ── ISO 27001 ──
  {
    refCode: "REQ-019",
    title: "ISO 27001:2022 standard representation",
    description:
      "Full structure (Clauses 4-10, Annex A). Navigable drill-down. Official wording. Planning & Risk Treatment. SoA auto-generation with export. Nonconformity/corrective action tracking. Relationship chain (Clause→Control→Risk→Policy→Evidence→Asset). Bidirectional traceability. Validation rules.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.14-15 — ISO 27001 Standard Specific",
  },

  // ── ISO 20000-1 (SMS) ──
  {
    refCode: "REQ-020",
    title: "ISO 20000-1:2018 standard + Service Portfolio/Catalogue",
    description:
      "Full structure (Clauses 4-10). Service Portfolio (Planned/Live/Retired + Components). Service Catalogue with all specified fields (ID, category, criticality, RPO, hours, availability). Approval workflows. Immutable audit records.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.16-17 — SMS Standard Specific",
  },

  // ── ISO 27701 (PIMS) ──
  {
    refCode: "REQ-021",
    title: "ISO 27701:2025 PIA Module",
    description:
      "Full structure with controller/processor reqs. PIA Dashboard with register, filters, search. Full PIA lifecycle with auto-save. Privacy risks (multiple per PIA, auto-calc, owners required). Residual risk handling (Sr Mgmt approval for High/Very High). Review/approval workflow. PIA Register View with PDF export. Relationships and traceability. Validation rules.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.17-19 — PIMS Standard Specific",
  },

  // ── NDPA 2023 ──
  {
    refCode: "REQ-022",
    title: "NDPA ROPA Module",
    description:
      "ROPA as top-level nav from PIMS dashboard. Create/edit processing activity records. Auto-generated editable reference numbers. 28-field schema with specified input types. Approval workflow with immutable published versions.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.19-21 — NDPA Standard Specific",
  },

  // ── ISO 22301 (BCMS) ──
  {
    refCode: "REQ-023",
    title: "ISO 22301:2019 BCMS standard",
    description:
      "Structure (Clauses 4-10) with cross-standard mapping. BIA Configuration (MTPD, RTO, RPO, dependencies). Impact Over Time. Criticality determination. BCP Coverage Management. Risk-BCM integration. BCP Testing/Scheduling. Tasks/Alerts/Notifications. Data Validation. Reporting.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.21-23 — BCMS Standard Specific",
  },

  // ── GDPR ──
  {
    refCode: "REQ-024",
    title: "UK/EU GDPR (entire standard)",
    description:
      "Standard representation (Articles 1-99), ROPA (Art 30), DPIA (Art 35-36), Consent Management, Data Subject Rights (Art 15-22), Data Breach Management (Art 33-34), Third-Party/Processor Management (Art 28), Relationships, Traceability, Validation, Reporting.",
    classification: "post_mvp" as const,
    source: "document" as const,
    sourceDetail:
      "Client Requirements Doc p.24-26 — DEFERRED: Entirely new regulatory domain. 6 new sub-modules. 8-12 weeks. Zero team GDPR knowledge. NDPA/PIMS covers privacy for Nigeria market.",
  },

  // ── PCI DSS ──
  {
    refCode: "REQ-025",
    title: "PCI DSS module-specific enhancements",
    description:
      "Fix invitation links. Product tour. Client Admin approve/reject only. Project phases (Scoping, Gap Assessment, Gap Remediation, Final Audit). Accurate evidence mapping per sub-requirement. N/A functionality. Gap auto-close on evidence accept. Full audit trail (1yr). All PCI DSS requirements/sub-requirements correct. Policy Maker AI maintains template. Bulk regenerate gaps. Phase notifications.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.29-32 — PCI DSS Module + Standard Specific",
  },
  {
    refCode: "REQ-026",
    title: "PCI DSS standard representation (Req 1-12, v4.0.1)",
    description:
      "Display full PCI DSS structure (Requirements 1-12, sub-requirements). Structured, navigable format. Official wording. Versioning support.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.32 — PCI DSS Standard Specific",
  },

  // ── INTEGRATIONS ──
  {
    refCode: "REQ-027",
    title: "Integration: Vulnerability Management Tools",
    description:
      "API integration with Qualys VM, Tenable Nessus. Automated vulnerability data ingestion. Normalization. Asset/risk mapping. Scan scheduling. Remediation tracking. Dashboards.",
    classification: "post_mvp" as const,
    source: "document" as const,
    sourceDetail:
      "Client Requirements Doc p.35 — DEFERRED: 4-6 weeks for 2 integrations. Must validate manual flow first.",
  },
  {
    refCode: "REQ-028",
    title: "Integration: Cloud Service Providers & Dev Platforms",
    description:
      "AWS, GCP, Azure, GitHub, GitLab, DigitalOcean, Oracle Cloud. Cloud config monitoring, asset discovery, compliance monitoring, DevSecOps integration.",
    classification: "post_mvp" as const,
    source: "document" as const,
    sourceDetail:
      "Client Requirements Doc p.36 — DEFERRED: 7 platforms, each unique API. Cloud posture monitoring alone is 3-4 weeks.",
  },
  {
    refCode: "REQ-029",
    title: "Integration: Endpoint Agent for Workstation Compliance",
    description:
      "Endpoint agent for monitoring OS patches, AV/EDR, encryption, firewall, USB policies. Policy enforcement. Real-time telemetry. Risk integration. Offline handling.",
    classification: "post_mvp" as const,
    source: "document" as const,
    sourceDetail:
      "Client Requirements Doc p.37 — DEFERRED: This is a separate software product. Native OS app. 6+ months.",
  },

  // ── TREND ANALYSIS ──
  {
    refCode: "REQ-030",
    title: "Trend Analysis: Core trending and KPIs",
    description:
      "Compliance score trending per framework/period. Custom date ranges. Trend lines (improving/declining/stagnant). Domain breakdown. KPIs dashboard (top/underperforming areas). Heatmap with drill-down.",
    classification: "mvp" as const,
    source: "document" as const,
    sourceDetail: "Client Requirements Doc p.38-41 — Trend Analysis (MVP scope)",
  },
  {
    refCode: "REQ-031",
    title: "Trend Analysis: Advanced features",
    description:
      "Milestone & Benchmark Tracking (milestones on charts, historical baseline, YoY/QoQ). Improvement & Decline Indicators (configurable thresholds, streaks). Actionable AI Insights. Export (PDF/CSV). Scheduled email reports. Mobile-responsive visualizations.",
    classification: "post_mvp" as const,
    source: "document" as const,
    sourceDetail:
      "Client Requirements Doc p.39-41 — DEFERRED: Advanced analytics requiring historical data that won't exist at launch.",
  },
];

// ── Tasks — 55 across 4 weeks ──────────────────────────────────────────────
const TASKS_DATA = [
  // ── WEEK 1: Core Fixes & Foundation ──
  { refCode: "T-001", title: "Fix invitation link unreachable issue", reqRefCode: "REQ-025", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "PLT-01", testCaseId: "PLT-01" },
  { refCode: "T-002", title: "Verify nav menu renders all 10 modules correctly", reqRefCode: "REQ-001", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "PLT-01", testCaseId: "PLT-01" },
  { refCode: "T-003", title: "Org data isolation validation (multi-tenant check)", reqRefCode: "REQ-002", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "PLT-01", testCaseId: "PLT-02" },
  { refCode: "T-004", title: "Client Admin role: approve/reject only, no upload", reqRefCode: "REQ-025", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "PCI-04", testCaseId: "PCI-04" },
  { refCode: "T-005", title: "Fix risk creation flow (currently broken)", reqRefCode: "REQ-011", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "RSK-01", testCaseId: "RSK-01" },
  { refCode: "T-006", title: "Implement Inherent Risk auto-calc (Likelihood × Impact)", reqRefCode: "REQ-011", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "RSK-02", testCaseId: "RSK-02" },
  { refCode: "T-007", title: "Implement Control Effectiveness + Residual Risk calculation", reqRefCode: "REQ-011", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "RSK-02", testCaseId: "RSK-02" },
  { refCode: "T-008", title: "AI risk scenario generation from context board", reqRefCode: "REQ-011", ownerId: "user_engineer", priority: "p1_high" as const, week: "W1", dodRef: "RSK-01", testCaseId: "RSK-01" },
  { refCode: "T-009", title: "Auto status change (Open→Ongoing→Closed) on control implementation", reqRefCode: "REQ-011", ownerId: "user_engineer", priority: "p1_high" as const, week: "W1", dodRef: "RSK-03", testCaseId: "RSK-03" },
  { refCode: "T-010", title: "Evidence upload + Admin accept/decline with status revert", reqRefCode: "REQ-011", ownerId: "user_engineer", priority: "p1_high" as const, week: "W1", dodRef: "RSK-04", testCaseId: "RSK-04" },
  { refCode: "T-011", title: "Fix evidence upload reliability", reqRefCode: "REQ-014", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "EVD-01", testCaseId: "EVD-01" },
  { refCode: "T-012", title: "Mandatory fields at evidence upload (Title, File, Framework, Control Ref)", reqRefCode: "REQ-014", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "EVD-01", testCaseId: "EVD-01" },
  { refCode: "T-013", title: "Evidence lifecycle (In Review → Approved/Rejected/Expired)", reqRefCode: "REQ-014", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "EVD-01", testCaseId: "EVD-01" },
  { refCode: "T-014", title: "Rejection with mandatory reason + client notification", reqRefCode: "REQ-014", ownerId: "user_engineer", priority: "p1_high" as const, week: "W1", dodRef: "EVD-02", testCaseId: "EVD-02" },
  { refCode: "T-015", title: "Fix assessment creation flow (currently broken)", reqRefCode: "REQ-010", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "ASM-01", testCaseId: "ASM-01" },
  { refCode: "T-016", title: "Assessment creation across all 6 standards", reqRefCode: "REQ-010", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W1", dodRef: "ASM-01", testCaseId: "ASM-01" },

  // ── WEEK 2: Complete Core + Standards Prep ──
  { refCode: "T-017", title: "Audit domain mgmt with evidence upload per clause/control", reqRefCode: "REQ-010", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W2", dodRef: "ASM-02", testCaseId: "ASM-02" },
  { refCode: "T-018", title: "Accept/reject evidence with mandatory comments", reqRefCode: "REQ-010", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W2", dodRef: "ASM-02", testCaseId: "ASM-02" },
  { refCode: "T-019", title: "Skip/backward navigation between audit domains", reqRefCode: "REQ-010", ownerId: "user_engineer", priority: "p1_high" as const, week: "W2", dodRef: "ASM-03", testCaseId: "ASM-03" },
  { refCode: "T-020", title: "Many-to-many evidence linking (1 evidence → multiple controls)", reqRefCode: "REQ-014", ownerId: "user_engineer", priority: "p1_high" as const, week: "W2", dodRef: "EVD-03", testCaseId: "EVD-03" },
  { refCode: "T-021", title: "Evidence version history (new uploads as versions)", reqRefCode: "REQ-014", ownerId: "user_engineer", priority: "p1_high" as const, week: "W2", dodRef: "EVD-04", testCaseId: "EVD-04" },
  { refCode: "T-022", title: "Evidence expiry notifications (30d + 7d) + auto-transition", reqRefCode: "REQ-014", ownerId: "user_engineer", priority: "p2_medium" as const, week: "W2", dodRef: "EVD-05", testCaseId: "EVD-05" },
  { refCode: "T-023", title: "Gap Tracker: manual creation + full lifecycle", reqRefCode: "REQ-012", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W2", dodRef: "GAP-01", testCaseId: "GAP-01" },
  { refCode: "T-024", title: "Gap closure requires approved evidence linked", reqRefCode: "REQ-012", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W2", dodRef: "GAP-01", testCaseId: "GAP-01" },
  { refCode: "T-025", title: "Bulk gap import + auto-import from assessments", reqRefCode: "REQ-012", ownerId: "user_engineer", priority: "p1_high" as const, week: "W2", dodRef: "GAP-02", testCaseId: "GAP-02" },
  { refCode: "T-026", title: "Gap-to-risk escalation (bidirectional link)", reqRefCode: "REQ-012", ownerId: "user_engineer", priority: "p1_high" as const, week: "W2", dodRef: "GAP-04", testCaseId: "GAP-04" },
  { refCode: "T-027", title: "Auto-close gap when evidence accepted (PCI DSS)", reqRefCode: "REQ-025", ownerId: "user_engineer", priority: "p1_high" as const, week: "W2", dodRef: "GAP-05", testCaseId: "PCI-03" },
  { refCode: "T-028", title: "Gap Remediation reports (PDF/Excel)", reqRefCode: "REQ-012", ownerId: "user_engineer", priority: "p2_medium" as const, week: "W2", dodRef: "GAP-05", testCaseId: "GAP-05" },
  { refCode: "T-029", title: "Policy Maker: Analyse Existing Policy flow (upload → AI gap analysis)", reqRefCode: "REQ-015", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W2", dodRef: "POL-01", testCaseId: "POL-01" },
  { refCode: "T-030", title: "Policy Maker: Create New Policy wizard", reqRefCode: "REQ-015", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W2", dodRef: "POL-03", testCaseId: "POL-03" },
  { refCode: "T-031", title: "Policy Maker: Regenerate Section (AI rewrite per gap)", reqRefCode: "REQ-015", ownerId: "user_engineer", priority: "p1_high" as const, week: "W2", dodRef: "POL-02", testCaseId: "POL-02" },
  { refCode: "T-032", title: "Policy lifecycle (Draft→Review→Approval→Active→Retired)", reqRefCode: "REQ-015", ownerId: "user_engineer", priority: "p1_high" as const, week: "W2", dodRef: "POL-04", testCaseId: "POL-04" },

  // ── WEEK 3: Standards + Dashboard ──
  { refCode: "T-033", title: "Dashboard: aggregated metrics from all modules", reqRefCode: "REQ-003", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W3", dodRef: "DSH-01", testCaseId: "DSH-01" },
  { refCode: "T-034", title: "Dashboard: clickable metric cards with drill-down", reqRefCode: "REQ-003", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W3", dodRef: "DSH-01", testCaseId: "DSH-01" },
  { refCode: "T-035", title: "Dashboard: Action Required panel", reqRefCode: "REQ-004", ownerId: "user_engineer", priority: "p1_high" as const, week: "W3", dodRef: "DSH-02", testCaseId: "DSH-02" },
  { refCode: "T-036", title: "Dashboard: PDF report generation", reqRefCode: "REQ-004", ownerId: "user_engineer", priority: "p2_medium" as const, week: "W3", dodRef: "DSH-03", testCaseId: "DSH-03" },
  { refCode: "T-037", title: "ISO 27001: full standard structure + navigation", reqRefCode: "REQ-019", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W3", dodRef: "ISO-01", testCaseId: "ISO-01" },
  { refCode: "T-038", title: "ISO 27001: SoA auto-generation + export", reqRefCode: "REQ-019", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W3", dodRef: "ISO-02", testCaseId: "ISO-02" },
  { refCode: "T-039", title: "ISO 27001: traceability chain (bidirectional)", reqRefCode: "REQ-019", ownerId: "user_engineer", priority: "p1_high" as const, week: "W3", dodRef: "ISO-03", testCaseId: "ISO-03" },
  { refCode: "T-040", title: "PCI DSS: Requirements 1-12 + sub-requirements (v4.0.1)", reqRefCode: "REQ-026", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W3", dodRef: "PCI-01", testCaseId: "PCI-01" },
  { refCode: "T-041", title: "PCI DSS: evidence mapping per sub-requirement + N/A", reqRefCode: "REQ-025", ownerId: "user_engineer", priority: "p0_critical" as const, week: "W3", dodRef: "PCI-02", testCaseId: "PCI-02" },
  { refCode: "T-042", title: "ISO 20000 (SMS): structure + Service Portfolio/Catalogue", reqRefCode: "REQ-020", ownerId: "user_engineer", priority: "p1_high" as const, week: "W3", dodRef: "SMS-01", testCaseId: "SMS-01" },
  { refCode: "T-043", title: "ISO 22301 (BCMS): structure + BIA + BCP coverage", reqRefCode: "REQ-023", ownerId: "user_engineer", priority: "p1_high" as const, week: "W3", dodRef: "BCM-01", testCaseId: "BCM-01" },
  { refCode: "T-044", title: "ISO 27701 (PIMS): structure + PIA full lifecycle", reqRefCode: "REQ-021", ownerId: "user_engineer", priority: "p1_high" as const, week: "W3", dodRef: "PIA-01", testCaseId: "PIA-01" },
  { refCode: "T-045", title: "NDPA: ROPA module with 28-field schema", reqRefCode: "REQ-022", ownerId: "user_engineer", priority: "p1_high" as const, week: "W3", dodRef: "ROPA-01", testCaseId: "ROPA-01" },

  // ── WEEK 4: Polish + Demos + Testing ──
  { refCode: "T-046", title: "Trend Analysis: compliance score trending + charts", reqRefCode: "REQ-030", ownerId: "user_engineer", priority: "p1_high" as const, week: "W4", dodRef: "TRD-01", testCaseId: "TRD-01" },
  { refCode: "T-047", title: "Trend Analysis: KPIs dashboard + heatmap", reqRefCode: "REQ-030", ownerId: "user_engineer", priority: "p1_high" as const, week: "W4", dodRef: "TRD-02", testCaseId: "TRD-02" },
  { refCode: "T-048", title: "Security settings module", reqRefCode: null, ownerId: "user_engineer", priority: "p1_high" as const, week: "W4", dodRef: "", testCaseId: "" },
  { refCode: "T-049", title: "Notifications & alerts system (all modules)", reqRefCode: null, ownerId: "user_engineer", priority: "p1_high" as const, week: "W4", dodRef: "", testCaseId: "" },
  { refCode: "T-050", title: "Role-based access control validation across all modules", reqRefCode: null, ownerId: "user_engineer", priority: "p1_high" as const, week: "W4", dodRef: "", testCaseId: "" },
  { refCode: "T-051", title: "Record ALL demo videos (one per test case)", reqRefCode: null, ownerId: "user_vello", priority: "p0_critical" as const, week: "W4", dodRef: "", testCaseId: "ALL" },
  { refCode: "T-052", title: "End-to-end smoke test: Onboard→Assess→Risk→Gap→Evidence→Report", reqRefCode: null, ownerId: "user_vello", priority: "p0_critical" as const, week: "W4", dodRef: "", testCaseId: "" },
  { refCode: "T-053", title: "Fix all bugs found during smoke testing", reqRefCode: null, ownerId: "user_engineer", priority: "p0_critical" as const, week: "W4", dodRef: "", testCaseId: "" },
  { refCode: "T-054", title: "Package all demo videos + DoD checklist for client", reqRefCode: null, ownerId: "user_vello", priority: "p0_critical" as const, week: "W4", dodRef: "", testCaseId: "" },
  { refCode: "T-055", title: "Generate requirement-to-feature traceability matrix", reqRefCode: null, ownerId: "user_vello", priority: "p0_critical" as const, week: "W4", dodRef: "", testCaseId: "" },
];

const SCOPE_CHANGES_DATA = [
  {
    title: "GDPR standard added (entire UK/EU regulatory framework)",
    description:
      "Client requested full GDPR implementation including ROPA, DPIA, Consent Management, Data Subject Rights, Data Breach Management, and Processor Management. This was not in the original scope.",
    source: "client_request" as const,
    sourceDetail: "Consolidated requirements doc p.24-26",
    impactDescription:
      "Adds 8-12 weeks of development. Requires new regulatory domain knowledge. 6 new sub-modules. Team has zero GDPR domain knowledge. NDPA/PIMS covers privacy for Nigeria market — GDPR deferred.",
    estimatedDays: 60,
    status: "deferred" as const,
  },
  {
    title: "Third Party Module (full vendor lifecycle management)",
    description:
      "Client requested complete vendor management: onboarding, due diligence, contract management, access mapping, continuous monitoring, offboarding, reporting.",
    source: "client_request" as const,
    sourceDetail: "Consolidated requirements doc p.11-12",
    impactDescription:
      "Adds 6-8 weeks. Entirely new domain concepts not present anywhere in current platform. Core compliance lifecycle (assessments, gaps, evidence, risks, policies) must be completed first. Interim: track via Risk Register.",
    estimatedDays: 45,
    status: "deferred" as const,
  },
  {
    title: "Vulnerability Management Tool integrations (Qualys, Tenable Nessus)",
    description:
      "Client requested API integration with external vulnerability scanners for automated data ingestion.",
    source: "client_request" as const,
    sourceDetail: "Consolidated requirements doc p.35",
    impactDescription:
      "4-6 weeks for 2 integrations. Vendor-specific APIs, auth flows, data normalization. Must validate manual compliance flow works end-to-end before automating data ingestion.",
    estimatedDays: 35,
    status: "deferred" as const,
  },
  {
    title: "Cloud Provider integrations (AWS, GCP, Azure, GitHub, GitLab, DO, Oracle)",
    description:
      "Client requested integration with 7 cloud/dev platforms for config monitoring, asset discovery, compliance monitoring, DevSecOps.",
    source: "client_request" as const,
    sourceDetail: "Consolidated requirements doc p.36",
    impactDescription:
      "Each platform has unique API, IAM roles, and data schemas. Cloud posture monitoring alone is 3-4 weeks. Combined: 8-12 weeks. Must complete core GRC platform before layering automated cloud ingestion.",
    estimatedDays: 60,
    status: "deferred" as const,
  },
  {
    title: "Endpoint Agent for Workstation Compliance",
    description:
      "Client requested a native endpoint agent deployed on workstations for compliance monitoring, policy enforcement, telemetry, and offline handling.",
    source: "client_request" as const,
    sourceDetail: "Consolidated requirements doc p.37",
    impactDescription:
      "This is a separate software product requiring native OS development (Windows/macOS/Linux). Kernel-level access, secure telemetry pipelines, offline caching. Companies like CrowdStrike have 50+ engineers for this. Phase 3+ roadmap item.",
    estimatedDays: 180,
    status: "deferred" as const,
  },
  {
    title: "PIMS (ISO 27701) and SMS (ISO 20000-1) added to MVP",
    description:
      "Originally MVP was ISMS + PCI DSS only. Client later insisted all 6 standards be built simultaneously during the engagement.",
    source: "meeting" as const,
    sourceDetail: "Multiple meetings over engagement period",
    impactDescription:
      "Doubled the standard-specific development work. Each standard has unique data models, workflows, and compliance logic. Accepted and absorbed into MVP scope — reflected in W3 task assignments.",
    estimatedDays: 30,
    status: "accepted" as const,
    acknowledgedBy: "user_ify",
    acknowledgedAt: new Date("2026-04-10"),
  },
  {
    title: "Policy Evaluation and Document Intelligence moved to MVP",
    description:
      "Originally post-MVP features. Client moved AI-driven policy analysis and document comparison to MVP scope during requirements revision.",
    source: "client_request" as const,
    sourceDetail: "Client feedback round — consolidated requirements doc revision",
    impactDescription:
      "AI-driven policy analysis and document comparison are complex features requiring prompt engineering and iterative testing. Accepted and absorbed — adds ~2 weeks to W2 scope.",
    estimatedDays: 15,
    status: "accepted" as const,
    acknowledgedBy: "user_ify",
    acknowledgedAt: new Date("2026-04-15"),
  },
];

const STANDUPS_DATA = [
  {
    userId: "user_vello",
    date: "2026-04-28",
    didYesterday: "Reviewed consolidated 40-page client requirements doc. Mapped all 31 requirements to MVP vs Post-MVP with justifications. Shared analysis with engineer.",
    doingToday: "Seed ShipLock with full DE-GRC project data. Brief engineer on W1 priorities — fix invitation links, risk module, evidence upload.",
    blockers: null,
  },
  {
    userId: "user_engineer",
    date: "2026-04-28",
    didYesterday: "Set up local dev environment for DE-GRC project. Reviewed codebase structure and identified broken flows (risk creation, assessment creation, evidence upload).",
    doingToday: "Starting T-001: Fix invitation link issue. Then T-005 risk creation flow. W1 is all critical fixes.",
    blockers: "Need client to confirm which invitation email address was used — link may have been sent to wrong contact.",
  },
  {
    userId: "user_vello",
    date: "2026-04-29",
    didYesterday: "Confirmed scope changes with client. GDPR, Third Party Module, and all integrations formally deferred. Client acknowledged via email.",
    doingToday: "Recording first demo video for invitation flow once T-001 is fixed. Drafting DoD test cases doc for client.",
    blockers: null,
  },
  {
    userId: "user_engineer",
    date: "2026-04-29",
    didYesterday: "Fixed invitation link (T-001). Root cause: env variable mismatch between staging and prod. Also fixed risk creation form validation (T-005).",
    doingToday: "T-006 + T-007: Implement risk scoring formulas (Inherent Risk = Likelihood × Impact, Residual = Inherent × (100% - CE)). Then evidence upload fix.",
    blockers: null,
  },
];

async function seedDeGRC() {
  console.log("Seeding Digital Encode GRC project into ShipLock...\n");

  // 1. Users
  console.log("Inserting users...");
  for (const user of NEW_USERS) {
    await db.insert(users).values(user).onConflictDoNothing();
  }
  console.log(`  ✓ ${NEW_USERS.length} users (vello, engineer, ify, profwale)`);

  // 2. Project
  console.log("Inserting project...");
  await db.insert(projects).values(PROJECT).onConflictDoNothing();
  console.log("  ✓ proj_de_grc — Digital Encode GRC Automation Tool");

  // 3. Requirements — insert and capture returned rows to build refCode→UUID map
  console.log("Inserting requirements...");
  const insertedReqs = await db
    .insert(requirements)
    .values(
      REQUIREMENTS_DATA.map((r) => ({
        projectId: PROJECT_ID,
        refCode: r.refCode,
        title: r.title,
        description: r.description,
        source: r.source,
        sourceDetail: r.sourceDetail,
        classification: r.classification,
        status: "approved" as const,
        clientApprovedBy: "user_ify",
        clientApprovedAt: new Date("2026-04-25"),
      }))
    )
    .onConflictDoNothing()
    .returning({ id: requirements.id, refCode: requirements.refCode });

  // Build lookup map: "REQ-001" → uuid
  const reqMap = new Map<string, string>();
  for (const r of insertedReqs) {
    reqMap.set(r.refCode, r.id);
  }

  const mvpCount = REQUIREMENTS_DATA.filter((r) => r.classification === "mvp").length;
  const postMvpCount = REQUIREMENTS_DATA.filter((r) => r.classification === "post_mvp").length;
  console.log(`  ✓ ${insertedReqs.length} requirements (${mvpCount} MVP, ${postMvpCount} Post-MVP)`);

  // 4. Tasks — use the refCode→UUID map for requirementId
  console.log("Inserting tasks...");
  let tasksInserted = 0;
  for (const t of TASKS_DATA) {
    const requirementId = t.reqRefCode ? reqMap.get(t.reqRefCode) ?? null : null;
    await db
      .insert(tasks)
      .values({
        projectId: PROJECT_ID,
        requirementId: requirementId ?? undefined,
        refCode: t.refCode,
        title: t.title,
        ownerId: t.ownerId,
        priority: t.priority,
        status: "not_started",
        week: t.week,
        dodRef: t.dodRef || null,
        testCaseId: t.testCaseId || null,
      })
      .onConflictDoNothing();
    tasksInserted++;
  }
  console.log(`  ✓ ${tasksInserted} tasks across W1–W4`);

  // 5. Scope changes
  console.log("Inserting scope changes...");
  for (const sc of SCOPE_CHANGES_DATA) {
    await db
      .insert(scopeChanges)
      .values({
        projectId: PROJECT_ID,
        title: sc.title,
        description: sc.description,
        source: sc.source,
        sourceDetail: sc.sourceDetail,
        impactDescription: sc.impactDescription,
        estimatedDays: sc.estimatedDays,
        status: sc.status,
        acknowledgedBy: "acknowledgedBy" in sc ? sc.acknowledgedBy : undefined,
        acknowledgedAt: "acknowledgedAt" in sc ? sc.acknowledgedAt : undefined,
      })
      .onConflictDoNothing();
  }
  console.log(`  ✓ ${SCOPE_CHANGES_DATA.length} scope changes (5 deferred, 2 accepted)`);

  // 6. Standups
  console.log("Inserting standups...");
  for (const s of STANDUPS_DATA) {
    await db
      .insert(standups)
      .values({
        projectId: PROJECT_ID,
        userId: s.userId,
        date: s.date,
        didYesterday: s.didYesterday,
        doingToday: s.doingToday,
        blockers: s.blockers ?? null,
      })
      .onConflictDoNothing();
  }
  console.log(`  ✓ ${STANDUPS_DATA.length} standups`);

  console.log("\n✅ Digital Encode GRC seed complete.");
  console.log(`   Project: ${PROJECT.name}`);
  console.log(`   URL: /shiplock/proj_de_grc/dashboard`);
  console.log(`   Requirements: ${REQUIREMENTS_DATA.length} total`);
  console.log(`   Tasks: ${TASKS_DATA.length} total across 4 weeks`);
  console.log(`   Scope changes: ${SCOPE_CHANGES_DATA.length} documented`);
  console.log(`   Standups: ${STANDUPS_DATA.length} entries`);
}

seedDeGRC().catch((e) => {
  console.error(e);
  process.exit(1);
});
