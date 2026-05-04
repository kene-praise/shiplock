import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CircleCheck, CircleDot, CircleMinus, AlertTriangle, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

const statusConfig = {
  not_started: { label: "Not Started", color: "text-zinc-400", bg: "bg-zinc-500/10", icon: CircleMinus },
  in_progress: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/10", icon: CircleDot },
  blocked:     { label: "Blocked",     color: "text-red-400",  bg: "bg-red-500/10",  icon: AlertTriangle },
  done:        { label: "Done",        color: "text-green-400", bg: "bg-green-500/10", icon: CircleCheck },
  cut:         { label: "Cut",         color: "text-zinc-600", bg: "bg-zinc-500/5",  icon: CircleMinus },
};

const priorityConfig = {
  p0_critical: { label: "P0", color: "text-red-400 bg-red-500/10" },
  p1_high:     { label: "P1", color: "text-orange-400 bg-orange-500/10" },
  p2_medium:   { label: "P2", color: "text-yellow-400 bg-yellow-500/10" },
  p3_low:      { label: "P3", color: "text-zinc-400 bg-zinc-500/10" },
};

const statusOrder = ["blocked", "in_progress", "not_started", "done", "cut"] as const;

export default async function TasksPage({ params }: Props) {
  const { org, project } = await params;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const taskList = await db
    .select({
      id: tasks.id,
      refCode: tasks.refCode,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      week: tasks.week,
      blockedReason: tasks.blockedReason,
      blockedBy: tasks.blockedBy,
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectData.id));

  const grouped = statusOrder.reduce((acc, status) => {
    acc[status] = taskList.filter((t) => t.status === status);
    return acc;
  }, {} as Record<string, typeof taskList>);

  const total = taskList.length;
  const done = taskList.filter((t) => t.status === "done").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {done}/{total} complete
          </p>
        </div>
        <Link
          href={`/${org}/${project}/tasks/new`}
          className="flex items-center gap-1.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Task
        </Link>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: total > 0 ? `${Math.round((done / total) * 100)}%` : "0%" }}
        />
      </div>

      {/* Grouped sections */}
      <div className="space-y-6">
        {statusOrder.map((status) => {
          const group = grouped[status];
          if (!group || group.length === 0) return null;
          const cfg = statusConfig[status];
          const Icon = cfg.icon;

          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.color}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-muted-foreground">{group.length}</span>
              </div>

              <div className="space-y-1.5">
                {group.map((task) => {
                  const pCfg = priorityConfig[task.priority as keyof typeof priorityConfig];
                  return (
                    <Link
                      key={task.id}
                      href={`/${org}/${project}/tasks/${task.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all group"
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                      <span className="ref-code">{task.refCode}</span>
                      <span className="flex-1 text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </span>
                      {task.week && (
                        <span className="text-xs text-muted-foreground">{task.week}</span>
                      )}
                      {pCfg && (
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", pCfg.color)}>
                          {pCfg.label}
                        </span>
                      )}
                      {task.status === "blocked" && task.blockedBy && (
                        <span className="text-xs text-red-400 truncate max-w-[120px]">
                          ↳ {task.blockedBy}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {taskList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
