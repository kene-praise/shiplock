"use client";

import { useState } from "react";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import { AlertTriangle, FileCheck, Clock } from "@/components/icons";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Req {
  id: string;
  refCode: string;
  title: string;
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
  task: {
    id: string;
    refCode: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    week: string | null;
    blockedBy: string | null;
    blockedReason: string | null;
    dodRef: string | null;
    requirementId: string | null;
    createdAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
  };
  req?: {
    id: string;
    refCode: string;
    title: string;
  };
  onCloseUrl: string;
  updateAction: (formData: FormData) => Promise<void>;
  history?: AuditLogItem[];
  reqs: Req[];
}

const statusConfig = {
  not_started: { label: "Not Started", color: "text-[var(--fg-muted)]", bg: "bg-[var(--component-fill)]" },
  in_progress: { label: "In Progress", color: "text-[var(--accent)]", bg: "bg-[var(--accent-muted)]" },
  blocked:     { label: "Blocked",     color: "text-[var(--danger)]",  bg: "bg-[var(--danger-muted)]" },
  done:        { label: "Done",        color: "text-[var(--success)]", bg: "bg-[var(--success-muted)]" },
  cut:         { label: "Cut",         color: "text-[var(--fg-muted)]", bg: "bg-[var(--component-fill)]" },
};

const priorityConfig = {
  p0_critical: { label: "P0 Critical", color: "text-[var(--danger)] bg-[var(--danger-muted)]" },
  p1_high:     { label: "P1 High",     color: "text-[var(--disputed)] bg-[var(--disputed-muted)]" },
  p2_medium:   { label: "P2 Medium",   color: "text-[var(--warning)] bg-[var(--warning-muted)]" },
  p3_low:      { label: "P3 Low",      color: "text-[var(--fg-muted)] bg-[var(--component-fill)]" },
};

function getDiff(oldVal: Record<string, unknown> | null, newVal: Record<string, unknown> | null): string[] {
  if (!oldVal || !newVal) return [];
  const changes: string[] = [];
  const keys = Object.keys(newVal);
  for (const key of keys) {
    if (key === "updatedAt" || key === "createdAt" || key === "ownerId" || key === "startedAt" || key === "completedAt") continue;
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

export function ViewTaskDialog({ org, project, task, req, onCloseUrl, updateAction, history, reqs }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [statusVal, setStatusVal] = useState(task.status);

  const handleClose = () => {
    setOpen(false);
    router.push(onCloseUrl);
  };

  const sCfg = statusConfig[task.status as keyof typeof statusConfig];
  const pCfg = priorityConfig[task.priority as keyof typeof priorityConfig];

  return (
    <AppDialog open={open} onClose={handleClose} title={isEditing ? `Edit Task: ${task.refCode}` : `${task.refCode} — Detail`}>
      {isEditing ? (
        <form action={async (fd) => {
          await updateAction(fd);
          setIsEditing(false);
        }} className="flex flex-col min-h-0">
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="field-label block">Title</label>
              <input name="title" required defaultValue={task.title} className="field-input" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Description</label>
              <textarea name="description" rows={3} defaultValue={task.description ?? ""} className="field-input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="field-label block">Priority</label>
                <select name="priority" defaultValue={task.priority} className="field-input">
                  <option value="p0_critical">P0 Critical</option>
                  <option value="p1_high">P1 High</option>
                  <option value="p2_medium">P2 Medium</option>
                  <option value="p3_low">P3 Low</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label block">Status</label>
                <select name="status" value={statusVal} onChange={(e) => setStatusVal(e.target.value)} className="field-input">
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                  <option value="cut">Cut</option>
                </select>
              </div>
            </div>

            {statusVal === "blocked" && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-muted)]">
                <div className="space-y-1.5">
                  <label className="field-label block text-[var(--danger)]">Blocked By</label>
                  <input name="blockedBy" required defaultValue={task.blockedBy ?? ""} className="field-input text-foreground" placeholder="e.g. Design review, client" />
                </div>
                <div className="space-y-1.5">
                  <label className="field-label block text-[var(--danger)]">Reason</label>
                  <input name="blockedReason" required defaultValue={task.blockedReason ?? ""} className="field-input text-foreground" placeholder="Detailed reason..." />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="field-label block">Target Week</label>
                <input name="week" defaultValue={task.week ?? ""} className="field-input" placeholder="e.g. Week 1, W2" />
              </div>
              <div className="space-y-1.5">
                <label className="field-label block">DoD Ref</label>
                <input name="dodRef" defaultValue={task.dodRef ?? ""} className="field-input" placeholder="e.g. RSK-01" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="field-label block">Linked Requirement</label>
              <select name="requirementId" defaultValue={task.requirementId ?? ""} className="field-input">
                <option value="">None</option>
                {reqs.map((r) => (
                  <option key={r.id} value={r.id}>{r.refCode} - {r.title}</option>
                ))}
              </select>
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
            {/* Status badges */}
            <div className="flex items-center gap-2 flex-wrap">
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

            {/* Title and Description */}
            <div className="space-y-2">
              <h1 className="text-[15px] font-semibold tracking-tight text-[var(--fg)]">{task.title}</h1>
              {task.description && (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{task.description}</p>
              )}
            </div>

            {/* Blocked warning */}
            {task.status === "blocked" && (
              <div className="flex gap-3 p-4 rounded-xl bg-[var(--danger-muted)] border border-[var(--danger)]/30">
                <AlertTriangle className="h-4 w-4 text-[var(--danger)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--danger)]">
                    Blocked by: {task.blockedBy ?? "Unknown"}
                  </p>
                  {task.blockedReason && (
                    <p className="text-xs text-[var(--danger)]/70 mt-0.5">{task.blockedReason}</p>
                  )}
                </div>
              </div>
            )}

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Created</p>
                <p className="text-sm text-foreground">{formatDate(task.createdAt)}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(task.createdAt)}</p>
              </div>
              {task.startedAt && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Started</p>
                  <p className="text-sm text-foreground">{formatDate(task.startedAt)}</p>
                </div>
              )}
              {task.completedAt && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Completed</p>
                  <p className="text-sm text-[var(--success)]">{formatDate(task.completedAt)}</p>
                </div>
              )}
              {task.dodRef && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">DoD Ref</p>
                  <p className="text-sm font-mono text-foreground">{task.dodRef}</p>
                </div>
              )}
            </div>

            {/* Linked requirement */}
            {req && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">Linked Requirement</p>
                <Link
                  href={`/${org}/${project}/requirements?requirement=${req.id}`}
                  onClick={handleClose}
                  className="flex items-center gap-3 hover:text-[var(--accent)] transition-colors group"
                >
                  <FileCheck className="h-4 w-4 text-muted-foreground group-hover:text-[var(--accent)]" />
                  <span className="ref-code">{req.refCode}</span>
                  <span className="text-sm text-foreground group-hover:text-[var(--accent)] truncate">{req.title}</span>
                </Link>
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
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsEditing(true)} className="btn-secondary">
                Edit
              </button>
              <button type="button" onClick={handleClose} className="btn-secondary">
                Close
              </button>
            </div>
          </DialogFooter>
        </>
      )}
    </AppDialog>
  );
}
