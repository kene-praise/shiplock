"use client";

import { useState } from "react";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import {
  CheckSquare, Clock, CircleCheck, CircleDot, CircleMinus,
  AlertTriangle, ClipboardCheck, Video, Send
} from "@/components/icons";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TaskItem {
  id: string;
  refCode: string;
  title: string;
  status: string;
}

interface DodItem {
  dod: {
    id: string;
    dodRef: string;
    criterion: string;
    met: boolean;
  };
  task: TaskItem | null;
  demo: {
    id: string;
    title: string;
    videoUrl: string;
  } | null;
}

interface DemoItem {
  id: string;
  title: string;
  videoUrl: string;
  clientStatus: string;
}

interface AuditLogItem {
  id: string;
  action: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: Date;
  user: { name: string } | null;
}

interface Props {
  org: string;
  project: string;
  req: {
    id: string;
    refCode: string;
    title: string;
    description: string;
    status: string;
    classification: string;
    autoApproved: boolean;
    createdAt: Date;
    clientApprovedAt: Date | null;
    autoApproveDeadline: Date | null;
    source: string;
    sourceDetail: string | null;
  };
  reqTasks: TaskItem[];
  reqDodItems: DodItem[];
  reqDemos: DemoItem[];
  onCloseUrl: string;
  deleteAction: (formData: FormData) => Promise<void>;
  reviewAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  history?: AuditLogItem[];
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

function getDiff(oldVal: Record<string, unknown> | null, newVal: Record<string, unknown> | null): string[] {
  if (!oldVal || !newVal) return [];
  const changes: string[] = [];
  const keys = Object.keys(newVal);
  for (const key of keys) {
    if (key === "updatedAt" || key === "createdAt" || key === "clientApprovedBy" || key === "clientApprovedAt" || key === "autoApproveDeadline") continue;
    const oldRaw = oldVal[key];
    const newRaw = newVal[key];
    if (JSON.stringify(oldRaw) !== JSON.stringify(newRaw)) {
      const keyLabel = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      changes.push(
        `Changed ${keyLabel} from "${oldRaw ?? 'none'}" to "${newRaw ?? 'none'}"`
      );
    }
  }
  return changes;
}

export function ViewRequirementDialog({
  org,
  project,
  req,
  reqTasks,
  reqDodItems,
  reqDemos,
  onCloseUrl,
  deleteAction,
  reviewAction,
  updateAction,
  history
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const handleClose = () => {
    setOpen(false);
    router.push(onCloseUrl);
  };

  const doneTasks = reqTasks.filter((t) => t.status === "done").length;

  return (
    <AppDialog open={open} onClose={handleClose} title={isEditing ? `Edit Requirement: ${req.refCode}` : `${req.refCode} — Detail`} width="lg">
      {isEditing ? (
        <form action={async (fd) => {
          await updateAction(fd);
          setIsEditing(false);
        }} className="flex flex-col min-h-0">
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="field-label block">Title</label>
              <input name="title" required defaultValue={req.title} className="field-input" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Description</label>
              <textarea name="description" rows={4} required defaultValue={req.description} className="field-input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="field-label block">Classification</label>
                <select name="classification" defaultValue={req.classification} className="field-input">
                  <option value="mvp">MVP</option>
                  <option value="post_mvp">Post-MVP</option>
                  <option value="out_of_scope">Out of Scope</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label block">Source</label>
                <select name="source" defaultValue={req.source} className="field-input">
                  <option value="document">Document</option>
                  <option value="meeting">Meeting</option>
                  <option value="email">Email</option>
                  <option value="verbal">Verbal</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="field-label block">Source Detail</label>
                <input name="sourceDetail" defaultValue={req.sourceDetail ?? ""} className="field-input" placeholder="e.g. Page 12, email thread title" />
              </div>
              <div className="space-y-1.5">
                <label className="field-label block">Status</label>
                <select name="status" defaultValue={req.status} className="field-input">
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
              Cancel
            </button>
            <SubmitButton pendingText="Saving…" className="btn-cta">
              Save Changes
            </SubmitButton>
          </DialogFooter>
        </form>
      ) : (
        <>
          <DialogBody className="space-y-5">
            {/* Header Metadata */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
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
            </div>

            {/* Title and Description */}
            <div className="space-y-2">
              <h1 className="text-[15px] font-semibold tracking-tight text-[var(--fg)]">{req.title}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{req.description}</p>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Source</p>
                <p className="text-sm text-foreground capitalize">{req.source}</p>
                {req.sourceDetail && (
                  <p className="text-xs text-muted-foreground">{req.sourceDetail}</p>
                )}
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Created</p>
                <p className="text-sm text-foreground">{formatDate(req.createdAt)}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(req.createdAt)}</p>
              </div>
              {req.clientApprovedAt && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Approved</p>
                  <p className="text-sm text-[var(--success)]">{formatDate(req.clientApprovedAt)}</p>
                </div>
              )}
              {req.autoApproveDeadline && req.status === "pending_approval" && (
                <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-muted)] p-3.5 space-y-1">
                  <p className="text-xs text-[var(--warning)] uppercase tracking-wide font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Auto-approve deadline
                  </p>
                  <p className="text-sm text-[var(--warning)]">{formatDate(req.autoApproveDeadline)}</p>
                </div>
              )}
            </div>

            {/* Tasks Checklist */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
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
                  onClick={handleClose}
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
                        href={`/${org}/${project}/tasks?task=${task.id}`}
                        onClick={handleClose}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group border border-transparent hover:border-[var(--border)]"
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
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    Definition of Done
                    <span className="text-xs text-muted-foreground font-normal">
                      {reqDodItems.filter((i) => i.dod.met).length}/{reqDodItems.length} met
                    </span>
                  </h2>
                  <Link href={`/${org}/${project}/dod`} onClick={handleClose} className="text-xs text-[var(--accent)] hover:underline">
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
                            <Link href={`/${org}/${project}/tasks?task=${task.id}`} onClick={handleClose} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                              <CheckSquare className="h-3 w-3" />
                              <span className="font-mono">{task.refCode}</span>
                              <span className={cn("text-[10px] px-1 py-0.5 rounded", taskStatusColor[task.status])}>
                                {task.status.replace("_", " ")}
                              </span>
                            </Link>
                          )}
                          {demo && (
                            <Link href={`/${org}/${project}/requirements?requirement=${req.id}&demoUrl=${encodeURIComponent(demo.videoUrl)}&demoTitle=${encodeURIComponent(demo.title)}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                              <Video className="h-3 w-3" />
                              {demo.title}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Videos */}
            {reqDemos.length > 0 && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  Demo Videos
                  <span className="text-xs text-muted-foreground font-normal">{reqDemos.length} recorded</span>
                </h2>
                <div className="space-y-2">
                  {reqDemos.map((demo) => (
                    <Link
                      key={demo.id}
                      href={`/${org}/${project}/requirements?requirement=${req.id}&demoUrl=${encodeURIComponent(demo.videoUrl)}&demoTitle=${encodeURIComponent(demo.title)}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group border border-transparent hover:border-[var(--border)]"
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
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Edit History Section */}
            {history && history.length > 0 && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Edit History
                </h2>
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                  {history.map((log) => {
                    const diff = getDiff(log.oldValue, log.newValue);
                    return (
                      <div key={log.id} className="text-[12px] border-l-2 border-[var(--border)] pl-3 py-0.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">{log.user?.name ?? "Builder"}</span>
                          <span>{formatRelativeTime(log.createdAt)}</span>
                        </div>
                        {diff.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground pl-1">
                            {diff.map((change, idx) => (
                              <li key={idx} className="truncate">{change}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground italic">Action: {log.action}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              {/* Danger delete button */}
              <form action={deleteAction} onSubmit={handleClose}>
                <button
                  type="submit"
                  className="btn-danger !h-8 !px-3.5 !text-[12.5px]"
                >
                  Delete
                </button>
              </form>

              <div className="flex items-center gap-2.5">
                <button type="button" onClick={() => setIsEditing(true)} className="btn-secondary">
                  Edit
                </button>
                <button type="button" onClick={handleClose} className="btn-secondary">
                  Close
                </button>
                {req.status === "draft" && (
                  <form action={reviewAction} onSubmit={handleClose}>
                    <button
                      type="submit"
                      className="btn-cta !h-8 !px-3.5 !text-[12.5px] shrink-0"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
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
          </DialogFooter>
        </>
      )}
    </AppDialog>
  );
}
