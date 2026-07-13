import { db } from "@/db";
import { scopeChanges, auditLogs, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getProjectForOrg } from "@/lib/project";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GitBranch, Clock, CheckCircle2, AlertTriangle } from "@/components/icons";
import { dailyCounts } from "@/lib/utils";
import {
  T, KpiCard, Badge, SectionLabel, PageHeader, BarChart, type ToneKey,
} from "@/components/dashboard-ui";
import { NewScopeChangeDialog } from "@/components/dialogs/NewScopeChangeDialog";
import { createScopeChange, updateScopeChange, updateScopeChangeStatus } from "@/lib/actions/scope-changes";
import { ViewScopeChangeDialog } from "@/components/dialogs/ViewScopeChangeDialog";

interface ScopeChangesPageProps {
  params: Promise<{ org: string; project: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const stTone: Record<string, ToneKey> = {
  pending: "amber", accepted: "green", rejected: "red", deferred: "gray",
};

function impactFromDays(days: number | null): { label: string; tone: ToneKey } {
  if (days != null && days >= 3) return { label: "high impact", tone: "red" };
  if (days != null && days >= 1) return { label: "medium impact", tone: "amber" };
  return { label: "low impact", tone: "green" };
}

export default async function ScopeChangesPage({ params, searchParams }: ScopeChangesPageProps) {
  const { org, project } = await params;
  const sParams = await searchParams;
  const selectedChangeId = typeof sParams.scope_change === "string" ? sParams.scope_change : undefined;

  const projectData = await getProjectForOrg(org, project);
  if (!projectData) notFound();

  const changes = await db
    .select()
    .from(scopeChanges)
    .where(eq(scopeChanges.projectId, projectData.id))
    .orderBy(scopeChanges.createdAt);

  let selectedChangeData = null;
  if (selectedChangeId) {
    const [change] = await db.select().from(scopeChanges).where(eq(scopeChanges.id, selectedChangeId)).limit(1);
    if (change) {
      const changeHistory = await db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          oldValue: auditLogs.oldValue,
          newValue: auditLogs.newValue,
          createdAt: auditLogs.createdAt,
          user: { name: users.name },
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(and(eq(auditLogs.entityId, selectedChangeId), eq(auditLogs.entityType, "scope_change")))
        .orderBy(desc(auditLogs.createdAt));
      selectedChangeData = { change, changeHistory };
    }
  }

  const total = changes.length;
  const counts = {
    pending:  changes.filter((c) => c.status === "pending").length,
    accepted: changes.filter((c) => c.status === "accepted").length,
    rejected: changes.filter((c) => c.status === "rejected").length,
    deferred: changes.filter((c) => c.status === "deferred").length,
  };
  const dailyScope = dailyCounts(changes.map((c) => c.createdAt), 14);
  const daysWithScope = dailyScope.filter(Boolean).length;

  return (
    <div className="min-h-full w-full max-w-[1100px] mx-auto px-8 py-6 flex flex-col gap-4">
      <PageHeader title="Scope Changes" meta={`${total} total · ${counts.pending} pending`}>
        <NewScopeChangeDialog action={createScopeChange.bind(null, projectData.id, org, project)} />
      </PageHeader>

      {total === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center py-24 text-center animate-enter">
          <GitBranch className="h-8 w-8 text-[var(--fg-disabled)] mb-3" />
          <p className="text-[13px] font-medium text-[var(--fg)]">No scope changes yet</p>
          <p className="text-[11px] text-[var(--fg-muted)] mt-1">Log changes when clients ask for new work.</p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
            <KpiCard icon={GitBranch}     label="Total"    value={`${total}`}           sub="Changes logged" tone="blue" />
            <KpiCard icon={Clock}         label="Pending"  value={`${counts.pending}`}  sub="Need decision"  tone="amber" />
            <KpiCard icon={CheckCircle2}  label="Accepted" value={`${counts.accepted}`} sub="Approved"       tone="green" />
            <KpiCard icon={AlertTriangle} label="Rejected" value={`${counts.rejected}`} sub="Declined"       tone="red" />
          </div>

          {/* Status breakdown */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 animate-enter" style={{ "--stagger": 2 } as React.CSSProperties}>
            <SectionLabel>Status breakdown</SectionLabel>
            <div className="h-2.5 rounded-[var(--radius-full)] overflow-hidden flex gap-px my-4 bg-[var(--bg-muted)]">
              {(["pending", "accepted", "rejected", "deferred"] as const).map((k) => counts[k] > 0 && (
                <div key={k} className="h-full" style={{ width: `${(counts[k] / total) * 100}%`, background: T[stTone[k]].fg }} />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {(["pending", "accepted", "rejected", "deferred"] as const).map((k) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ background: T[stTone[k]].fg }} />
                    <span className="text-[11px] text-[var(--fg-secondary)] capitalize">{k}</span>
                  </div>
                  <span className="text-[22px] font-semibold tabular-nums tracking-tight text-[var(--fg)] leading-none">{counts[k]}</span>
                  <span className="text-[11px] text-[var(--fg-muted)] tabular-nums">{Math.round((counts[k] / total) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Creep trend */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 animate-enter" style={{ "--stagger": 3 } as React.CSSProperties}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <SectionLabel>Creep trend · 14d</SectionLabel>
                <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Each bar = 1 day · height = items added</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-[24px] font-semibold tabular-nums tracking-tight text-[var(--fg)] leading-none">+{daysWithScope}</span>
                  <span className="text-[12px] text-[var(--fg-muted)] mb-0.5">days with new scope</span>
                </div>
              </div>
            </div>
            <div style={{ height: 68, overflow: "hidden" }}>
              <BarChart points={dailyScope} color={T.red.fg} height={68} annotate />
            </div>
          </div>

          {/* Change cards */}
          <div className="animate-enter" style={{ "--stagger": 4 } as React.CSSProperties}>
            <SectionLabel>All changes</SectionLabel>
            <div className="mt-2.5 flex flex-col gap-2">
              {changes.map((ch) => {
                const imp = impactFromDays(ch.estimatedDays);
                return (
                  <Link
                    key={ch.id}
                    href={`/${org}/${project}/scope-changes?scope_change=${ch.id}`}
                    className="block bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-150"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge label={ch.status.charAt(0).toUpperCase() + ch.status.slice(1)} tone={stTone[ch.status] ?? "gray"} />
                        <Badge label={imp.label} tone={imp.tone} />
                      </div>
                      {ch.estimatedDays != null && (
                        <span className="text-[12px] font-mono font-medium text-[var(--fg-secondary)] shrink-0 tabular-nums">+{ch.estimatedDays}d</span>
                      )}
                    </div>
                    <p className="text-[13.5px] font-medium text-[var(--fg)] mb-1">{ch.title}</p>
                    <p className="text-[12px] text-[var(--fg-secondary)] leading-relaxed line-clamp-2">{ch.description}</p>
                    <p className="text-[10px] font-semibold text-[var(--fg-muted)] uppercase tracking-[0.08em] mt-2">
                      Via {ch.source.replace("_", " ")}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {selectedChangeData && (
        <ViewScopeChangeDialog
          change={selectedChangeData.change}
          onCloseUrl={`/${org}/${project}/scope-changes`}
          updateAction={updateScopeChange.bind(null, selectedChangeData.change.id, org, project)}
          statusAction={async (status) => {
            "use server";
            await updateScopeChangeStatus(selectedChangeData.change.id, status, org, project);
          }}
          history={selectedChangeData.changeHistory as { id: string; action: string; oldValue: Record<string, unknown> | null; newValue: Record<string, unknown> | null; createdAt: Date; user: { name: string } | null }[]}
        />
      )}
    </div>
  );
}
