"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import { Plus } from "@/components/icons";

interface Req { id: string; refCode: string; title: string; }

interface Props {
  action: (formData: FormData) => Promise<void>;
  reqs: Req[];
}

function FormWatcher({ onSuccess }: { onSuccess: () => void }) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (pending) {
      wasPending.current = true;
    } else if (wasPending.current && !pending) {
      wasPending.current = false;
      onSuccess();
    }
  }, [pending, onSuccess]);

  return null;
}

export function NewTaskDialog({ action, reqs }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-cta !h-8 !px-3.5 !text-[12.5px]">
        <Plus size={13} /> New Task
      </button>

      <AppDialog open={open} onClose={() => setOpen(false)} title="New Task" description="A ref code will be assigned automatically.">
        <form action={action} className="flex flex-col min-h-0">
          <FormWatcher onSuccess={() => setOpen(false)} />
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="field-label block">Title</label>
              <input name="title" required autoFocus placeholder="What needs to be done?" className="field-input" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Description <span className="font-normal normal-case text-[var(--fg-disabled)]">(optional)</span></label>
              <textarea name="description" rows={2} placeholder="Additional context..." className="field-input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="field-label block">Priority</label>
                <select name="priority" className="field-input">
                  <option value="p0_critical">P0 — Critical</option>
                  <option value="p1_high">P1 — High</option>
                  <option value="p2_medium">P2 — Medium</option>
                  <option value="p3_low">P3 — Low</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label block">Week</label>
                <select name="week" className="field-input">
                  <option value="">— None —</option>
                  {["W1","W2","W3","W4","W5","W6"].map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>
            {reqs.length > 0 && (
              <div className="space-y-1.5">
                <label className="field-label block">Linked Requirement <span className="font-normal normal-case text-[var(--fg-disabled)]">(optional)</span></label>
                <select name="requirementId" className="field-input">
                  <option value="">— None —</option>
                  {reqs.map((r) => <option key={r.id} value={r.id}>{r.refCode} — {r.title}</option>)}
                </select>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <SubmitButton pendingText="Creating…" className="btn-cta">
              Create Task
            </SubmitButton>
          </DialogFooter>
        </form>
      </AppDialog>
    </>
  );
}
