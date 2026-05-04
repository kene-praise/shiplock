import { db } from "@/db";
import { tasks, requirements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, FileCheck } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string; id: string }>;
}

const statusConfig = {
  not_started: { label: "Not Started", color: "text-zinc-400", bg: "bg-zinc-500/10" },
  in_progress: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/10" },
  blocked:     { label: "Blocked",     color: "text-red-400",  bg: "bg-red-500/10" },
  done:        { label: "Done",        color: "text-green-400", bg: "bg-green-500/10" },
  cut:         { label: "Cut",         color: "text-zinc-600", bg: "bg-zinc-500/5" },
};

const priorityConfig = {
  p0_critical: { label: "P0 Critical", color: "text-red-400 bg-red-500/10" },
  p1_high:     { label: "P1 High",     color: "text-orange-400 bg-orange-500/10" },
  p2_medium:   { label: "P2 Medium",   color: "text-yellow-400 bg-yellow-500/10" },
  p3_low:      { label: "P3 Low",      color: "text-zinc-400 bg-zinc-500/10" },
};

export default async function TaskDetailPage({ params }: Props) {
  const { org, project, id } = await params;

  const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  if (!task) notFound();

  const [req] = task.requirementId
    ? await db.select().from(requirements).where(eq(requirements.id, task.requirementId)).limit(1)
    : [undefined];

  const sCfg = statusConfig[task.status as keyof typeof statusConfig];
  const pCfg = priorityConfig[task.priority as keyof typeof priorityConfig];

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Back */}
      <Link
        href={`/${org}/${project}/tasks`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tasks
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="ref-code">{task.refCode}</span>
          {sCfg && (
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", sCfg.bg, sCfg.color)}>
              {sCfg.label}
            </span>
          )}
          {pCfg && (
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", pCfg.color)}>
              {pCfg.label}
            </span>
          )}
          {task.week && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
              {task.week}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-foreground">{task.title}</h1>
        {task.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
        )}
      </div>

      {/* Blocked warning */}
      {task.status === "blocked" && (
        <div className="flex gap-3 p-4 rounded-xl bg-red-950/30 border border-red-900/40">
          <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">
              Blocked by: {task.blockedBy ?? "Unknown"}
            </p>
            {task.blockedReason && (
              <p className="text-xs text-red-400/70 mt-0.5">{task.blockedReason}</p>
            )}
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Created</p>
          <p className="text-sm text-foreground">{formatDate(task.createdAt)}</p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(task.createdAt)}</p>
        </div>
        {task.startedAt && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Started</p>
            <p className="text-sm text-foreground">{formatDate(task.startedAt)}</p>
          </div>
        )}
        {task.completedAt && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Completed</p>
            <p className="text-sm text-green-400">{formatDate(task.completedAt)}</p>
          </div>
        )}
        {task.dodRef && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">DoD Ref</p>
            <p className="text-sm font-mono text-foreground">{task.dodRef}</p>
          </div>
        )}
      </div>

      {/* Linked requirement */}
      {req && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">Linked Requirement</p>
          <Link
            href={`/${org}/${project}/requirements/${req.id}`}
            className="flex items-center gap-3 hover:text-primary transition-colors group"
          >
            <FileCheck className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            <span className="ref-code">{req.refCode}</span>
            <span className="text-sm text-foreground group-hover:text-primary truncate">{req.title}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
