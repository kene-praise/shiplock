import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CircleCheck, CircleDot, CircleMinus, AlertTriangle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

const statusConfig = {
  not_started: { label: "Not Started", color: "text-zinc-500",   bg: "bg-zinc-500/10",  icon: CircleMinus, headerBg: "bg-zinc-50",   border: "border-zinc-200" },
  in_progress: { label: "In Progress", color: "text-blue-600",   bg: "bg-blue-500/10",  icon: CircleDot,   headerBg: "bg-blue-50",   border: "border-blue-200" },
  blocked:     { label: "Blocked",     color: "text-red-600",    bg: "bg-red-500/10",   icon: AlertTriangle, headerBg: "bg-red-50", border: "border-red-200" },
  done:        { label: "Done",        color: "text-green-600",  bg: "bg-green-500/10", icon: CircleCheck, headerBg: "bg-green-50",  border: "border-green-200" },
  cut:         { label: "Cut",         color: "text-zinc-500",   bg: "bg-zinc-500/5",   icon: CircleMinus, headerBg: "bg-zinc-50",   border: "border-zinc-200" },
};

const priorityConfig = {
  p0_critical: { label: "P0", color: "text-red-600 bg-red-50 border border-red-200" },
  p1_high:     { label: "P1", color: "text-orange-600 bg-orange-50 border border-orange-200" },
  p2_medium:   { label: "P2", color: "text-yellow-700 bg-yellow-50 border border-yellow-200" },
  p3_low:      { label: "P3", color: "text-zinc-500 bg-zinc-100 border border-zinc-200" },
};

export default async function TasksPage({ params }: Props) {
  const { org, project } = await params;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const taskList = await db
    .select({ id: tasks.id, refCode: tasks.refCode, title: tasks.title, status: tasks.status, priority: tasks.priority, week: tasks.week, blockedReason: tasks.blockedReason, blockedBy: tasks.blockedBy })
    .from(tasks).where(eq(tasks.projectId, projectData.id));

  const total = taskList.length;
  const done  = taskList.filter((t) => t.status === "done").length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  // Group into 3 visual columns
  const attention = taskList.filter((t) => t.status === "blocked" || t.status === "in_progress")
    .sort((a) => (a.status === "blocked" ? -1 : 1));
  const notStarted = taskList.filter((t) => t.status === "not_started");
  const finished   = taskList.filter((t) => t.status === "done" || t.status === "cut");

  const columns = [
    { key: "attention", label: "Needs Attention", tasks: attention, statuses: ["blocked", "in_progress"] as const },
    { key: "queue",     label: "Queue",            tasks: notStarted, statuses: ["not_started"] as const },
    { key: "done",      label: "Finished",         tasks: finished,  statuses: ["done", "cut"] as const },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{done}/{total} complete · {pct}%</p>
        </div>
        <Link href={`/${org}/${project}/tasks/new`}
          className="flex items-center gap-1.5 text-sm bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="h-3.5 w-3.5" /> New Task
        </Link>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-muted-foreground">No tasks yet. Add your first task to get started.</p>
        </div>
      ) : (
        /* 3-column kanban */
        <div className="grid grid-cols-3 gap-4 items-start">
          {columns.map((col) => (
            <div key={col.key} className="flex flex-col gap-2">
              {/* Column header */}
              <div className="flex items-center gap-2 px-1 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{col.label}</span>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{col.tasks.length}</span>
              </div>

              {col.tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                  <p className="text-xs text-muted-foreground">Nothing here</p>
                </div>
              ) : (
                col.tasks.map((task) => {
                  const cfg = statusConfig[task.status as keyof typeof statusConfig];
                  const pCfg = priorityConfig[task.priority as keyof typeof priorityConfig];
                  const Icon = cfg?.icon ?? CircleMinus;
                  return (
                    <Link
                      key={task.id}
                      href={`/${org}/${project}/tasks/${task.id}`}
                      className="group block rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors"
                    >
                      {/* Status + priority row */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className={cn("h-3.5 w-3.5 shrink-0", cfg?.color)} />
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", cfg?.color)}>{cfg?.label}</span>
                        {pCfg && (
                          <span className={cn("ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded", pCfg.color)}>
                            {pCfg.label}
                          </span>
                        )}
                      </div>

                      {/* Ref + title */}
                      <div className="flex items-start gap-2">
                        <span className="ref-code shrink-0 mt-px">{task.refCode}</span>
                        <span className="text-sm text-foreground font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {task.title}
                        </span>
                      </div>

                      {/* Blocked reason */}
                      {task.status === "blocked" && task.blockedBy && (
                        <p className="text-xs text-red-600 mt-2 truncate">↳ {task.blockedBy}</p>
                      )}

                      {/* Week chip */}
                      {task.week && (
                        <div className="mt-2.5 flex justify-end">
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{task.week}</span>
                        </div>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
