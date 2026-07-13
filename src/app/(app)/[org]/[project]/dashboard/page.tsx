import { db } from "@/db";
import { projects, tasks, scopeChanges } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { AlertTriangle, CheckCircle2, GitBranch, TrendingUp } from "@/components/icons";
import { formatRelativeTime, dailyCounts } from "@/lib/utils";
import {
  T, KpiCard, Badge, SectionLabel, PageHeader, VelocityChart, BarChart,
} from "@/components/dashboard-ui";

interface DashboardPageProps {
  params: Promise<{ org: string; project: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { project } = await params;

  const [projectData] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, project))
    .limit(1);

  if (!projectData) {
    return <div className="p-6 text-muted-foreground text-sm">Project not found.</div>;
  }

  const projectId = projectData.id;

  // Task stats
  const taskStats = await db
    .select({ status: tasks.status, count: count() })
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .groupBy(tasks.status);

  const totalTasks = taskStats.reduce((s, r) => s + Number(r.count), 0);
  const doneTasks = Number(taskStats.find((r) => r.status === "done")?.count ?? 0);
  const blockedTasks = Number(taskStats.find((r) => r.status === "blocked")?.count ?? 0);
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Completed task timestamps → daily velocity (28d)
  const completedRows = await db
    .select({ completedAt: tasks.completedAt })
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), eq(tasks.status, "done")));
  const dailyVelocity = dailyCounts(completedRows.map((r) => r.completedAt), 28);

  // Weekly task breakdown (for velocity chart labels)
  const weeklyStats = await db
    .select({ week: tasks.week, status: tasks.status, count: count() })
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .groupBy(tasks.week, tasks.status);

  const weeks = ["W1", "W2", "W3", "W4"];
  const weekData = weeks.map((w) => {
    const wTasks = weeklyStats.filter((r) => r.week === w);
    const total = wTasks.reduce((s, r) => s + Number(r.count), 0);
    const done = Number(wTasks.find((r) => r.status === "done")?.count ?? 0);
    return { week: w, total, done };
  });

  // Scope changes — counts by status + 7d creep
  const scopeRows = await db
    .select({ status: scopeChanges.status, createdAt: scopeChanges.createdAt })
    .from(scopeChanges)
    .where(eq(scopeChanges.projectId, projectId));
  const scopeTotal = scopeRows.length;
  const scopePending = scopeRows.filter((c) => c.status === "pending").length;
  const scopeAccepted = scopeRows.filter((c) => c.status === "accepted").length;
  const scopeRejected = scopeRows.filter((c) => c.status === "rejected").length;
  const dailyScope = dailyCounts(scopeRows.map((c) => c.createdAt), 7);

  // Blocked tasks detail
  const blockedItems = await db
    .select({
      id: tasks.id,
      refCode: tasks.refCode,
      title: tasks.title,
      blockedBy: tasks.blockedBy,
      blockedReason: tasks.blockedReason,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), eq(tasks.status, "blocked")))
    .orderBy(tasks.updatedAt)
    .limit(10);

  return (
    <div className="min-h-full w-full max-w-[1100px] mx-auto px-8 py-6 flex flex-col gap-4">
      <PageHeader
        title={projectData.name}
        meta={projectData.mvpDeadline ? `MVP · ${projectData.mvpDeadline}` : "No deadline set"}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
        <KpiCard icon={TrendingUp}    label="Completion"    value={`${completionPct}%`}  sub={blockedTasks === 0 ? "On track" : "At risk"} tone="blue" />
        <KpiCard icon={CheckCircle2}  label="Tasks done"    value={`${doneTasks}`}       sub={`of ${totalTasks}`}        tone="green" />
        <KpiCard icon={AlertTriangle} label="Blocked"       value={`${blockedTasks}`}    sub={blockedTasks > 0 ? "Need action" : "Clear"} tone="red" />
        <KpiCard icon={GitBranch}     label="Scope changes" value={`${scopeTotal}`}      sub={`${scopePending} pending`} tone="amber" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_190px] gap-3 animate-enter" style={{ "--stagger": 2 } as React.CSSProperties}>
        {/* Velocity card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 flex flex-col">
          <div>
            <SectionLabel>Sprint velocity · 28d</SectionLabel>
            <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Each bar = 1 day · grouped by week</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-[28px] font-semibold tabular-nums tracking-tight text-[var(--fg)] leading-none">
                {doneTasks} tasks
              </span>
              <span className="text-[12px] text-[var(--fg-muted)] mb-0.5">{completionPct}% of {totalTasks}</span>
            </div>
          </div>
          <div className="flex-1" />
          <div style={{ height: 96, overflow: "hidden" }}>
            <VelocityChart points={dailyVelocity} weeks={weekData} color={T.blue.fg} />
          </div>
        </div>

        {/* Scope creep card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden flex flex-col">
          <div className="p-4 flex flex-col flex-1">
            <SectionLabel>Scope creep · 7d</SectionLabel>
            <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Each bar = 1 day</p>
            <div className="mt-2.5">
              <span className="text-[28px] font-semibold tabular-nums tracking-tight text-[var(--fg)] leading-none">
                +{scopeTotal}
              </span>
              <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">items added</p>
            </div>
            <div className="flex-1" />
            <div style={{ height: 56, overflow: "hidden" }}>
              <BarChart points={dailyScope} color={T.red.fg} height={56} annotate />
            </div>
          </div>

          <div
            className="px-4 py-3 flex flex-col gap-2"
            style={{ background: "var(--card-footer)", borderTop: "1px solid var(--border-footer)" }}
          >
            {([
              { label: "Pending",  n: scopePending,  tone: "amber" as const },
              { label: "Accepted", n: scopeAccepted, tone: "green" as const },
              { label: "Rejected", n: scopeRejected, tone: "red"   as const },
            ]).map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--fg-secondary)]">{r.label}</span>
                <Badge label={`${r.n}`} tone={r.tone} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blocked */}
      <div className="animate-enter" style={{ "--stagger": 3 } as React.CSSProperties}>
        <div className="flex items-center justify-between mb-2.5">
          <SectionLabel>Blocked — needs action</SectionLabel>
          <span className="text-[11px] font-semibold tabular-nums" style={{ color: T.red.fg }}>{blockedItems.length} open</span>
        </div>
        {blockedItems.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 text-center">
            <p className="text-[12px] text-[var(--fg-muted)]">No blocked items. Great work.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {blockedItems.map((item) => {
              const critical = !!item.blockedBy;
              return (
                <div key={item.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 flex items-center gap-4 transition-[border-color,box-shadow] duration-150 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="ref-code">{item.refCode}</span>
                      <Badge label={critical ? "Critical" : "Warning"} tone={critical ? "red" : "amber"} />
                    </div>
                    <p className="text-[13.5px] font-medium text-[var(--fg)] truncate">{item.title}</p>
                    {(item.blockedBy || item.blockedReason) && (
                      <p className="text-[12px] text-[var(--fg-muted)] mt-0.5 truncate">↳ {item.blockedBy ?? item.blockedReason}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-semibold tabular-nums" style={{ color: critical ? T.red.fg : T.amber.fg }}>
                      {formatRelativeTime(item.updatedAt)}
                    </div>
                    <div className="text-[10px] text-[var(--fg-muted)] mt-0.5">updated</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
