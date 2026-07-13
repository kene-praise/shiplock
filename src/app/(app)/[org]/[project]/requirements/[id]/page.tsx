import { db } from "@/db";
import { requirements, tasks, dodItems, demoVideos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckSquare, Clock,
  CircleCheck, CircleDot, CircleMinus, AlertTriangle,
  ClipboardCheck, Video, Send,
} from "@/components/icons";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { sendRequirementForReview, deleteRequirement } from "@/lib/actions/requirements";

interface Props {
  params: Promise<{ org: string; project: string; id: string }>;
}

const statusStyles: Record<string, string> = {
  draft: "bg-[var(--component-fill)] text-[var(--fg-muted)]",
  pending_approval: "bg-[var(--warning-muted)] text-[var(--warning)]",
  approved: "bg-[var(--success-muted)] text-[var(--success)]",
  disputed: "bg-[var(--disputed-muted)] text-[var(--disputed)]",
};

const classStyles: Record<string, string> = {
  mvp: "bg-[var(--accent-muted)] text-[var(--accent)]",
  post_mvp: "bg-[var(--accent-muted)] text-[var(--accent)]",
  out_of_scope: "bg-[var(--component-fill)] text-[var(--fg-muted)]",
};

const taskStatusIcon: Record<string, React.ElementType> = {
  not_started: CircleMinus,
  in_progress: CircleDot,
  blocked: AlertTriangle,
  done: CircleCheck,
  cut: CircleMinus,
};

const taskStatusColor: Record<string, string> = {
  not_started: "text-[var(--fg-muted)]",
  in_progress: "text-[var(--accent)]",
  blocked: "text-[var(--danger)]",
  done: "text-[var(--success)]",
  cut: "text-[var(--fg-muted)]",
};

export default async function RequirementDetailPage({ params }: Props) {
  const { org, project, id } = await params;

  const [req] = await db
    .select()
    .from(requirements)
    .where(eq(requirements.id, id))
    .limit(1);

  if (!req) notFound();

  const reqTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.requirementId, id));

  const doneTasks = reqTasks.filter((t) => t.status === "done").length;

  const reqDodItems = await db
    .select({
      dod: dodItems,
      task: { id: tasks.id, refCode: tasks.refCode, title: tasks.title, status: tasks.status },
      demo: { id: demoVideos.id, title: demoVideos.title, videoUrl: demoVideos.videoUrl, clientStatus: demoVideos.clientStatus },
    })
    .from(dodItems)
    .leftJoin(tasks, eq(dodItems.taskId, tasks.id))
    .leftJoin(demoVideos, eq(dodItems.demoVideoId, demoVideos.id))
    .where(eq(dodItems.requirementId, id));

  const reqDemos = await db
    .select({ id: demoVideos.id, title: demoVideos.title, videoUrl: demoVideos.videoUrl, clientStatus: demoVideos.clientStatus })
    .from(demoVideos)
    .where(eq(demoVideos.requirementId, id));

  return (
    <div className="px-5 py-4 max-w-3xl space-y-4">
      {/* Back */}
      <Link
        href={`/${org}/${project}/requirements`}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Requirements
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="ref-code">{req.refCode}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[req.status] ?? "bg-[var(--component-fill)] text-[var(--fg-muted)]"}`}>
              {req.status.replace(/_/g, " ")}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${classStyles[req.classification] ?? ""}`}>
              {req.classification.replace(/_/g, " ")}
            </span>
            {req.autoApproved && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[var(--accent-muted)] text-[var(--accent)]">
                Auto-approved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <form action={deleteRequirement.bind(null, req.id, org, project)}>
              <button
                type="submit"
                className="btn-danger !h-8 !px-3.5 !text-[12.5px]"
              >
                Delete
              </button>
            </form>
            {req.status === "draft" && (
              <form action={sendRequirementForReview.bind(null, req.id, org, project)}>
                <button
                  type="submit"
                  className="btn-cta !h-8 !px-3.5 !text-[12.5px] shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send for review
                </button>
              </form>
            )}
            {req.status === "pending_approval" && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--warning)] shrink-0">
                <Clock className="h-3.5 w-3.5" />
                Awaiting client response
              </div>
            )}
          </div>
        </div>
        <h1 className="text-[15px] font-semibold tracking-tight text-[var(--fg)]">{req.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{req.description}</p>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Source</p>
          <p className="text-sm text-foreground capitalize">{req.source}</p>
          {req.sourceDetail && (
            <p className="text-xs text-muted-foreground">{req.sourceDetail}</p>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Created</p>
          <p className="text-sm text-foreground">{formatDate(req.createdAt)}</p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(req.createdAt)}</p>
        </div>
        {req.clientApprovedAt && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Approved</p>
            <p className="text-sm text-[var(--success)]">{formatDate(req.clientApprovedAt)}</p>
          </div>
        )}
        {req.autoApproveDeadline && req.status === "pending_approval" && (
          <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-muted)] p-4 space-y-1">
            <p className="text-xs text-[var(--warning)] uppercase tracking-wide font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" /> Auto-approve deadline
            </p>
            <p className="text-sm text-[var(--warning)]">{formatDate(req.autoApproveDeadline)}</p>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            Tasks
            <span className="text-xs text-muted-foreground font-normal">
              {doneTasks}/{reqTasks.length} done
            </span>
          </h2>
          <Link
            href={`/${org}/${project}/tasks`}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            View all tasks
          </Link>
        </div>

        {reqTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No tasks linked to this requirement.</p>
        ) : (
          <div className="space-y-2">
            {reqTasks.map((task) => {
              const Icon = taskStatusIcon[task.status] ?? CircleMinus;
              const color = taskStatusColor[task.status] ?? "text-[var(--fg-muted)]";
              return (
                <Link
                  key={task.id}
                  href={`/${org}/${project}/tasks/${task.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                  <span className="ref-code">{task.refCode}</span>
                  <span className="text-sm text-foreground flex-1 truncate group-hover:text-[var(--accent)] transition-colors">
                    {task.title}
                  </span>
                  <span className={`text-xs capitalize ${color}`}>
                    {task.status.replace("_", " ")}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Definition of Done */}
      {reqDodItems.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              Definition of Done
              <span className="text-xs text-muted-foreground font-normal">
                {reqDodItems.filter((i) => i.dod.met).length}/{reqDodItems.length} met
              </span>
            </h2>
            <Link href={`/${org}/${project}/dod`} className="text-xs text-[var(--accent)] hover:underline">
              Full checklist →
            </Link>
          </div>
          <div className="space-y-2">
            {reqDodItems.map(({ dod, task, demo }) => (
              <div key={dod.id} className={cn("flex items-start gap-3 p-3 rounded-lg", dod.met ? "bg-[var(--success-muted)]" : "bg-muted/30")}>
                {dod.met
                  ? <CircleCheck className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
                  : <CircleMinus className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0 space-y-1">
                  <p className={cn("text-sm", dod.met && "text-muted-foreground line-through")}>
                    <span className="font-mono text-xs text-muted-foreground mr-2">{dod.dodRef}</span>
                    {dod.criterion}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {task && (
                      <Link href={`/${org}/${project}/tasks/${task.id}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <CheckSquare className="h-3 w-3" />
                        <span className="font-mono">{task.refCode}</span>
                        <span className={cn("text-[10px] px-1 py-0.5 rounded", taskStatusColor[task.status])}>
                          {task.status.replace("_", " ")}
                        </span>
                      </Link>
                    )}
                    {demo && (
                      <a href={demo.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <Video className="h-3 w-3" />
                        {demo.title}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo videos for this requirement */}
      {reqDemos.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Video className="h-4 w-4 text-muted-foreground" />
            Demo Videos
            <span className="text-xs text-muted-foreground font-normal">{reqDemos.length} recorded</span>
          </h2>
          <div className="space-y-2">
            {reqDemos.map((demo) => (
              <a
                key={demo.id}
                href={demo.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-foreground flex-1 truncate group-hover:text-[var(--accent)] transition-colors">
                  {demo.title}
                </span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", {
                  "text-[var(--success)] bg-[var(--success-muted)]": demo.clientStatus === "approved",
                  "text-[var(--warning)] bg-[var(--warning-muted)]": demo.clientStatus === "pending",
                  "text-[var(--danger)] bg-[var(--danger-muted)]": demo.clientStatus === "rejected",
                  "text-[var(--fg-muted)] bg-[var(--component-fill)]": demo.clientStatus === "no_response",
                })}>
                  {demo.clientStatus.replace("_", " ")}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
