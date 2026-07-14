"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import { Plus } from "@/components/icons";
import type { FormState } from "@/lib/actions/form-state";

interface Req { id: string; refCode: string; title: string; classification: string; }

interface Props {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  reqs: Req[];
  todayISO: string;
}

function FormWatcher({ onSuccess, hasError }: { onSuccess: () => void; hasError: boolean }) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    if (pending) {
      wasPending.current = true;
    } else if (wasPending.current && !pending) {
      wasPending.current = false;
      if (!hasError) onSuccess();
    }
  }, [pending, onSuccess, hasError]);

  return null;
}

export function NewDemoDialog({ action, reqs, todayISO }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, null);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-cta !h-8 !px-3.5 !text-[12.5px]">
        <Plus size={13} /> Add Demo
      </button>

      <AppDialog open={open} onClose={() => setOpen(false)} title="Add Demo Video" description="Paste a video URL and link it to the feature it demonstrates.">
        <form action={formAction} className="flex flex-col min-h-0">
          <FormWatcher onSuccess={() => setOpen(false)} hasError={!!state?.error} />
          <DialogBody className="space-y-4">
            {state?.error && (
              <div className="rounded-[var(--radius-md)] border border-[var(--danger)] bg-[var(--danger-muted)] px-3.5 py-2.5 text-[12.5px] text-[var(--danger)]">
                {state.error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="field-label block">Title</label>
              <input name="title" required autoFocus placeholder="e.g. Risk register — evidence upload flow" className="field-input" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Feature / Requirement</label>
              <select name="requirementId" className="field-input">
                <option value="">— Not linked to a specific requirement —</option>
                {reqs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.refCode} · {r.title}{r.classification === "post_mvp" ? " (Post-MVP)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Video URL</label>
              <input name="videoUrl" type="url" required placeholder="https://loom.com/share/..." className="field-input" />
              <p className="text-[11.5px] text-[var(--fg-muted)] mt-1">Loom, YouTube, Google Drive, or any direct link.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="field-label block">Recorded On</label>
                <input name="recordedAt" type="date" defaultValue={todayISO} className="field-input" />
              </div>
              <div className="space-y-1.5">
                <label className="field-label block">Duration (sec) <span className="font-normal normal-case text-[var(--fg-disabled)]">(optional)</span></label>
                <input name="durationSeconds" type="number" min="0" placeholder="e.g. 180" className="field-input" />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <SubmitButton pendingText="Adding…" className="btn-cta">
              Add Demo
            </SubmitButton>
          </DialogFooter>
        </form>
      </AppDialog>
    </>
  );
}
