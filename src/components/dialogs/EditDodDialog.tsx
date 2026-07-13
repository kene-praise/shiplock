"use client";

import { useState } from "react";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import { Clock } from "@/components/icons";
import { formatRelativeTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface TaskItem {
  id: string;
  refCode: string;
  title: string;
}

interface DemoItem {
  id: string;
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
  dod: {
    id: string;
    dodRef: string;
    criterion: string;
    met: boolean;
    taskId: string | null;
    demoVideoId: string | null;
  };
  tasks: TaskItem[];
  demos: DemoItem[];
  onCloseUrl: string;
  updateAction: (formData: FormData) => Promise<void>;
  history?: AuditLogItem[];
}

function getDiff(oldVal: Record<string, unknown> | null, newVal: Record<string, unknown> | null): string[] {
  if (!oldVal || !newVal) return [];
  const changes: string[] = [];
  const keys = Object.keys(newVal);
  for (const key of keys) {
    if (key === "updatedAt" || key === "createdAt" || key === "metAt") continue;
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

export function EditDodDialog({ dod, tasks, demos, onCloseUrl, updateAction, history }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    router.push(onCloseUrl);
  };

  return (
    <AppDialog open={open} onClose={handleClose} title={`Edit DoD Item: ${dod.dodRef}`}>
      <form action={async (fd) => {
        await updateAction(fd);
        handleClose();
      }} className="flex flex-col min-h-0">
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <label className="field-label block">Criterion</label>
            <textarea name="criterion" rows={3} required defaultValue={dod.criterion} className="field-input resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="field-label block">Status</label>
              <select name="met" defaultValue={dod.met ? "true" : "false"} className="field-input">
                <option value="false">Unmet</option>
                <option value="true">Met</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="field-label block">Linked Task</label>
              <select name="taskId" defaultValue={dod.taskId ?? ""} className="field-input">
                <option value="">None</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.refCode} - {t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="field-label block">Linked Demo Video</label>
            <select name="demoVideoId" defaultValue={dod.demoVideoId ?? ""} className="field-input">
              <option value="">None</option>
              {demos.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>

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
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <SubmitButton pendingText="Saving…" className="btn-cta">
            Save Changes
          </SubmitButton>
        </DialogFooter>
      </form>
    </AppDialog>
  );
}
