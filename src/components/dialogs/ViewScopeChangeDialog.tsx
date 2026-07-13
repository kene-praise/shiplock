"use client";

import { useState } from "react";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import { GitBranch, Clock } from "@/components/icons";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AuditLogItem {
  id: string;
  action: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: Date;
  user: { name: string } | null;
}

interface Props {
  change: {
    id: string;
    title: string;
    description: string;
    source: string;
    sourceDetail: string | null;
    impactDescription: string;
    estimatedDays: number | null;
    status: string;
    createdAt: Date;
    acknowledgedAt: Date | null;
  };
  onCloseUrl: string;
  updateAction: (formData: FormData) => Promise<void>;
  statusAction: (status: "accepted" | "rejected" | "deferred") => Promise<void>;
  history?: AuditLogItem[];
}

const statusConfig = {
  pending:  { label: "Pending Decision", color: "text-[var(--warning)] bg-[var(--warning-muted)]" },
  accepted: { label: "Accepted",         color: "text-[var(--success)] bg-[var(--success-muted)]" },
  rejected: { label: "Rejected",         color: "text-[var(--danger)] bg-[var(--danger-muted)]" },
  deferred: { label: "Deferred",         color: "text-[var(--fg-muted)] bg-[var(--component-fill)]" },
};

function getDiff(oldVal: Record<string, unknown> | null, newVal: Record<string, unknown> | null): string[] {
  if (!oldVal || !newVal) return [];
  const changes: string[] = [];
  const keys = Object.keys(newVal);
  for (const key of keys) {
    if (key === "updatedAt" || key === "createdAt" || key === "acknowledgedAt" || key === "acknowledgedBy") continue;
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

export function ViewScopeChangeDialog({ change, onCloseUrl, updateAction, statusAction, history }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const handleClose = () => {
    setOpen(false);
    router.push(onCloseUrl);
  };

  const sCfg = statusConfig[change.status as keyof typeof statusConfig];

  return (
    <AppDialog open={open} onClose={handleClose} title={isEditing ? "Edit Scope Change" : "Scope Change Details"}>
      {isEditing ? (
        <form action={async (fd) => {
          await updateAction(fd);
          setIsEditing(false);
        }} className="flex flex-col min-h-0">
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="field-label block">Title</label>
              <input name="title" required defaultValue={change.title} className="field-input" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Description</label>
              <textarea name="description" rows={3} required defaultValue={change.description} className="field-input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="field-label block">Source</label>
                <select name="source" defaultValue={change.source} className="field-input">
                  <option value="client_request">Client Request</option>
                  <option value="meeting">Meeting</option>
                  <option value="internal">Internal</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label block">Source Detail</label>
                <input name="sourceDetail" defaultValue={change.sourceDetail ?? ""} className="field-input" placeholder="e.g. Page 12, email thread title" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Impact Description</label>
              <textarea name="impactDescription" rows={2} required defaultValue={change.impactDescription} className="field-input resize-none" placeholder="Describe the impact on project delivery..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="field-label block">Estimated Days</label>
                <input type="number" name="estimatedDays" defaultValue={change.estimatedDays ?? ""} className="field-input" placeholder="e.g. 5" />
              </div>
              <div className="space-y-1.5">
                <label className="field-label block">Status</label>
                <select name="status" defaultValue={change.status} className="field-input">
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="deferred">Deferred</option>
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
            {/* Header badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              {sCfg && (
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", sCfg.color)}>
                  {sCfg.label}
                </span>
              )}
              <span className="text-xs text-muted-foreground capitalize">
                Via {change.source.replace("_", " ")}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h1 className="text-[15px] font-semibold tracking-tight text-[var(--fg)]">{change.title}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{change.description}</p>
            </div>

            {/* Impact section */}
            <div className="rounded-xl border border-[var(--disputed)]/30 bg-[var(--disputed-muted)] p-4 space-y-2">
              <p className="text-xs text-[var(--disputed)] uppercase tracking-wide font-medium">Impact</p>
              <p className="text-sm text-foreground leading-relaxed">{change.impactDescription}</p>
              {change.estimatedDays != null && (
                <p className="text-sm font-semibold text-[var(--disputed)]">+{change.estimatedDays} estimated days</p>
              )}
            </div>

            {/* Meta details grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Logged</p>
                <p className="text-sm text-foreground">{formatDate(change.createdAt)}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(change.createdAt)}</p>
              </div>
              {change.sourceDetail && (
                <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Source details</p>
                  <p className="text-sm text-foreground">{change.sourceDetail}</p>
                </div>
              )}
              {change.acknowledgedAt && (
                <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Decision Date</p>
                  <p className="text-sm text-foreground">{formatDate(change.acknowledgedAt)}</p>
                </div>
              )}
            </div>

            {/* Quick Actions if Pending */}
            {change.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => statusAction("accepted")}
                  className="flex-1 py-2 rounded-lg bg-[var(--success)] hover:brightness-110 text-white text-sm font-medium transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => statusAction("rejected")}
                  className="flex-1 py-2 rounded-lg bg-[var(--danger-muted)] hover:bg-[var(--danger)] hover:text-white text-[var(--danger)] text-sm font-medium transition-colors border border-[var(--danger)]/30"
                >
                  Reject
                </button>
                <button
                  onClick={() => statusAction("deferred")}
                  className="flex-1 py-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground text-sm font-medium transition-colors"
                >
                  Defer
                </button>
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
