import Link from "next/link";
import { db } from "@/db";
import { requirements, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { FileCheck, CheckCircle2, Clock, AlertTriangle, Layers, Upload } from "@/components/icons";
import { cumulativeDaily } from "@/lib/utils";
import {
  T, KpiCard, Badge, SectionLabel, PageHeader, SecondaryLink, LineChart, type ToneKey,
} from "@/components/dashboard-ui";
import { NewRequirementDialog } from "@/components/dialogs/NewRequirementDialog";
import { createRequirement } from "@/lib/actions/requirements";

interface RequirementsPageProps {
  params: Promise<{ org: string; project: string }>;
}

const clsTone: Record<string, ToneKey> = { mvp: "blue", post_mvp: "gray", out_of_scope: "red" };
const clsLabel: Record<string, string> = { mvp: "MVP", post_mvp: "Post-MVP", out_of_scope: "Out of scope" };
const stTone: Record<string, ToneKey> = { draft: "gray", pending_approval: "amber", approved: "green", disputed: "red" };
const stLabel: Record<string, string> = { draft: "Draft", pending_approval: "Pending", approved: "Approved", disputed: "Disputed" };

export default async function RequirementsPage({ params }: RequirementsPageProps) {
  const { org, project } = await params;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const reqs = await db
    .select()
    .from(requirements)
    .where(eq(requirements.projectId, projectData.id))
    .orderBy(requirements.refCode);

  const total = reqs.length;
  const counts = {
    approved: reqs.filter((r) => r.status === "approved").length,
    pending:  reqs.filter((r) => r.status === "pending_approval").length,
    draft:    reqs.filter((r) => r.status === "draft").length,
    disputed: reqs.filter((r) => r.status === "disputed").length,
    mvp:      reqs.filter((r) => r.classification === "mvp").length,
  };
  const approvalPct = total > 0 ? Math.round((counts.approved / total) * 100) : 0;

  // Approval trend — cumulative approved requirements over 14d
  const approvedDates = reqs.filter((r) => r.status === "approved").map((r) => r.clientApprovedAt);
  const priorApproved = approvedDates.filter((d) => {
    if (!d) return true;
    return (Date.now() - new Date(d).getTime()) / 86_400_000 >= 14;
  }).length;
  const approvalTrend = cumulativeDaily(approvedDates, 14, priorApproved);

  const metaRows: { k: keyof typeof counts; l: string; t: ToneKey }[] = [
    { k: "approved", l: "Approved", t: "green" },
    { k: "pending",  l: "Pending",  t: "amber" },
    { k: "draft",    l: "Draft",    t: "gray" },
    { k: "disputed", l: "Disputed", t: "red" },
  ];

  return (
    <div className="min-h-full w-full max-w-[1100px] mx-auto px-8 py-6 flex flex-col gap-4">
      <PageHeader title="Requirements" meta={`${total} total · ${approvalPct}% approved`}>
        <SecondaryLink href={`/${org}/${project}/requirements/import`}>
          <Upload className="h-3.5 w-3.5" /> Import
        </SecondaryLink>
        <NewRequirementDialog action={createRequirement.bind(null, projectData.id, org, project)} />
      </PageHeader>

      {total === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center py-24 text-center animate-enter">
          <FileCheck className="h-8 w-8 text-[var(--fg-disabled)] mb-3" />
          <p className="text-[13px] font-medium text-[var(--fg)]">No requirements yet</p>
          <p className="text-[11px] text-[var(--fg-muted)] mt-1">Import a document or add requirements manually.</p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
            <KpiCard icon={Layers}        label="MVP scope" value={`${counts.mvp}`}      sub={`of ${total}`}   tone="blue" />
            <KpiCard icon={CheckCircle2}  label="Approved"  value={`${counts.approved}`} sub="Client-signed"   tone="green" />
            <KpiCard icon={Clock}         label="Pending"   value={`${counts.pending}`}  sub="Awaiting client" tone="amber" />
            <KpiCard icon={AlertTriangle} label="Disputed"  value={`${counts.disputed}`} sub="Conflict"        tone="red" />
          </div>

          {/* Approval overview */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden animate-enter" style={{ "--stagger": 2 } as React.CSSProperties}>
            <div className="p-5">
              <div className="mb-3">
                <SectionLabel>Approval rate</SectionLabel>
                <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Running total of approved requirements over time</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-[28px] font-semibold tabular-nums tracking-tight text-[var(--fg)] leading-none">{approvalPct}%</span>
                  <span className="text-[12px] text-[var(--fg-muted)] mb-0.5">client-approved</span>
                </div>
              </div>
              <div style={{ height: 64, overflow: "hidden" }}>
                <LineChart points={approvalTrend} color={T.green.fg} height={64} />
              </div>
            </div>
            <div
              className="grid grid-cols-4 gap-3 px-5 py-4"
              style={{ background: "var(--card-footer)", borderTop: "1px solid var(--border-footer)" }}
            >
              {metaRows.map((r) => (
                <div key={r.k}>
                  <div className="text-[20px] font-semibold tabular-nums tracking-tight text-[var(--fg)] leading-none mb-1.5">
                    {counts[r.k]}
                  </div>
                  <Badge label={r.l} tone={r.t} />
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="animate-enter" style={{ "--stagger": 3 } as React.CSSProperties}>
            <SectionLabel>All requirements</SectionLabel>
            <div className="mt-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--card-footer)", borderBottom: "1px solid var(--border-footer)" }}>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)]">Ref</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)]">Requirement</th>
                    <th className="hidden sm:table-cell text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)]">Scope</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {reqs.map((req) => (
                    <tr key={req.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/${org}/${project}/requirements/${req.id}`}>
                          <span className="ref-code">{req.refCode}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[12.5px] font-medium text-[var(--fg)]">
                        <Link href={`/${org}/${project}/requirements/${req.id}`} className="hover:text-[var(--accent)] transition-colors">
                          {req.title}
                        </Link>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <Badge label={clsLabel[req.classification]} tone={clsTone[req.classification] ?? "gray"} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          label={req.autoApproved ? "Auto-approved" : stLabel[req.status] ?? req.status}
                          tone={req.autoApproved ? "green" : (stTone[req.status] ?? "gray")}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
