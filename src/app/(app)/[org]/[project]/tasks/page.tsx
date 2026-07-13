import { db } from "@/db";
import { tasks, projects, requirements, auditLogs, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, TrendingUp, AlertTriangle, Clock } from "@/components/icons";
import { dailyCounts, cumulativeDaily } from "@/lib/utils";
import {
  T, KpiCard, Badge, SectionLabel, PageHeader, LineChart, BarChart, type ToneKey,
} from "@/components/dashboard-ui";
import { NewTaskDialog } from "@/components/dialogs/NewTaskDialog";
import { createTask, updateTask } from "@/lib/actions/tasks";
import { ViewTaskDialog } from "@/components/dialogs/ViewTaskDialog";

interface TasksPageProps {
  params: Promise<{ org: string; project: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const pTone: Record<string, ToneKey> = {
  p0_critical: "red", p1_high: "amber", p2_medium: "blue", p3_low: "gray",
};
const pLabel: Record<string, string> = {
  p0_critical: "P0", p1_high: "P1", p2_medium: "P2", p3_low: "P3",
};

export default async function TasksPage({ params, searchParams }: TasksPageProps) {
  const { org, project } = await params;
  const sParams = await searchParams;
  const selectedTaskId = typeof sParams.task === "string" ? sParams.task : undefined;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const [taskList, reqList] = await Promise.all([
    db.select({
      id: tasks.id, refCode: tasks.refCode, title: tasks.title, status: tasks.status,
      priority: tasks.priority, blockedBy: tasks.blockedBy, completedAt: tasks.completedAt,
    }).from(tasks).where(eq(tasks.projectId, projectData.id)),
    db.select({ id: requirements.id, refCode: requirements.refCode, title: requirements.title })
      .from(requirements).where(eq(requirements.projectId, projectData.id)),
  ]);

  let selectedTaskData = null;
  if (selectedTaskId) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, selectedTaskId)).limit(1);
    if (task) {
      const [req, taskHistory] = await Promise.all([
        task.requirementId
          ? db.select().from(requirements).where(eq(requirements.id, task.requirementId)).limit(1)
          : Promise.resolve([undefined]),
        db
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
          .where(and(eq(auditLogs.entityId, selectedTaskId), eq(auditLogs.entityType, "task")))
          .orderBy(desc(auditLogs.createdAt)),
      ]);
      selectedTaskData = { task, req: req[0], taskHistory };
    }
  }

  const total = taskList.length;
  const done = taskList.filter((t) => t.status === "done");
  const inProgress = taskList.filter((t) => t.status === "in_progress").length;
  const blocked = taskList.filter((t) => t.status === "blocked").length;
  const notStartedCount = taskList.filter((t) => t.status === "not_started").length;
  const pct = total > 0 ? Math.round((done.length / total) * 100) : 0;

  // Charts
  const dailyVelocity = dailyCounts(done.map((t) => t.completedAt), 28);
  const priorDone = done.filter((t) => {
    if (!t.completedAt) return true; // counts toward baseline if undated
    const d = new Date(t.completedAt);
    return (Date.now() - d.getTime()) / 86_400_000 >= 14;
  }).length;
  const completionTrend = cumulativeDaily(done.map((t) => t.completedAt), 14, priorDone);

  // Board columns
  const attention = taskList
    .filter((t) => t.status === "blocked" || t.status === "in_progress")
    .sort((a) => (a.status === "blocked" ? -1 : 1));
  const queue = taskList.filter((t) => t.status === "not_started");
  const finished = taskList.filter((t) => t.status === "done" || t.status === "cut");

  const columns: { key: string; label: string; tasks: typeof taskList; tone: ToneKey }[] = [
    { key: "attention", label: "Needs Attention", tasks: attention, tone: "red" },
    { key: "queue",     label: "Queue",           tasks: queue,     tone: "gray" },
    { key: "done",      label: "Finished",        tasks: finished,  tone: "green" },
  ];

  return (
    <div className="min-h-full w-full max-w-[1100px] mx-auto px-8 py-6 flex flex-col gap-4">
      <PageHeader title="Tasks" meta={`${done.length}/${total} complete · ${pct}%`}>
        <NewTaskDialog action={createTask.bind(null, projectData.id, org, project)} reqs={reqList} />
      </PageHeader>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
        <KpiCard icon={CheckCircle2}  label="Done"        value={`${done.length}`}      sub="Shipped"       tone="green" />
        <KpiCard icon={TrendingUp}    label="In progress" value={`${inProgress}`}       sub="Active"        tone="blue" />
        <KpiCard icon={AlertTriangle} label="Blocked"     value={`${blocked}`}          sub="Action needed" tone="red" />
        <KpiCard icon={Clock}         label="Not started" value={`${notStartedCount}`}  sub="Queued"        tone="gray" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-enter" style={{ "--stagger": 2 } as React.CSSProperties}>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
          <SectionLabel>Completion trend · 14d</SectionLabel>
          <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Cumulative tasks done over time</p>
          <div className="flex items-end gap-2 mt-2 mb-3">
            <span className="text-[28px] font-semibold tabular-nums tracking-tight text-[var(--fg)] leading-none">{done.length}</span>
            <span className="text-[12px] text-[var(--fg-muted)] mb-0.5">tasks · {pct}%</span>
          </div>
          <div style={{ height: 72, overflow: "hidden" }}>
            <LineChart points={completionTrend} color={T.green.fg} height={72} />
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
          <SectionLabel>Daily velocity · 28d</SectionLabel>
          <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Each bar = 1 day · recent = darker</p>
          <div className="flex items-end gap-2 mt-2 mb-3">
            <span className="text-[28px] font-semibold tabular-nums tracking-tight text-[var(--fg)] leading-none">
              {dailyVelocity.reduce((a, b) => a + b, 0)}
            </span>
            <span className="text-[12px] text-[var(--fg-muted)] mb-0.5">tasks shipped</span>
          </div>
          <div style={{ height: 72, overflow: "hidden" }}>
            <BarChart points={dailyVelocity} color={T.blue.fg} height={72} />
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="animate-enter" style={{ "--stagger": 3 } as React.CSSProperties}>
        <SectionLabel>Board</SectionLabel>
        {total === 0 ? (
          <div className="mt-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 text-center">
            <p className="text-[12px] text-[var(--fg-muted)]">No tasks yet. Add your first task to get started.</p>
          </div>
        ) : (
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
            {columns.map((col) => (
              <div key={col.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: "var(--card-footer)", borderBottom: "1px solid var(--border-footer)" }}
                >
                  <Badge label={col.label} tone={col.tone} />
                  <span className="text-[11px] font-mono tabular-nums text-[var(--fg-muted)]">{col.tasks.length}</span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  {col.tasks.length === 0 ? (
                    <p className="text-[11px] text-[var(--fg-muted)] text-center py-4">Nothing here</p>
                  ) : (
                    col.tasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/${org}/${project}/tasks?task=${task.id}`}
                        className="block p-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-150"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="ref-code">{task.refCode}</span>
                          <Badge label={pLabel[task.priority] ?? task.priority} tone={pTone[task.priority] ?? "gray"} />
                        </div>
                        <p className="text-[12.5px] font-medium text-[var(--fg)] leading-snug line-clamp-2">{task.title}</p>
                        {task.status === "blocked" && task.blockedBy && (
                          <p className="text-[11px] mt-1.5" style={{ color: T.red.fg }}>↳ {task.blockedBy}</p>
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTaskData && (
        <ViewTaskDialog
          org={org}
          project={project}
          task={selectedTaskData.task}
          req={selectedTaskData.req}
          onCloseUrl={`/${org}/${project}/tasks`}
          updateAction={updateTask.bind(null, selectedTaskData.task.id, org, project)}
          history={selectedTaskData.taskHistory as { id: string; action: string; oldValue: Record<string, unknown> | null; newValue: Record<string, unknown> | null; createdAt: Date; user: { name: string } | null }[]}
          reqs={reqList}
        />
      )}
    </div>
  );
}
