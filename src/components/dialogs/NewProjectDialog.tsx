"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import { Plus } from "@/components/icons";

interface Props {
  action: (formData: FormData) => Promise<void>;
  asCard?: boolean;
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

export function NewProjectDialog({ action, asCard }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {asCard ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex flex-col items-center justify-center gap-2 min-h-[120px] border border-dashed border-[var(--border)] rounded-[var(--radius-lg)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-muted)] transition-all"
        >
          <Plus size={18} />
          <span className="text-[12.5px] font-medium">New project</span>
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-cta !h-7 !px-3 !text-[12px]">
          <Plus size={13} /> New Project
        </button>
      )}

      <AppDialog open={open} onClose={() => setOpen(false)} title="New Project" description="Set up a new client project to start protecting deliveries.">
        <form action={action} className="flex flex-col min-h-0">
          <FormWatcher onSuccess={() => setOpen(false)} />
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="field-label block">Project Name</label>
              <input name="name" required autoFocus placeholder="e.g. Acme Corp Mobile App" className="field-input" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Description <span className="font-normal normal-case text-[var(--fg-disabled)]">(optional)</span></label>
              <textarea name="description" rows={2} placeholder="Brief description of what you're building..." className="field-input resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">MVP Deadline <span className="font-normal normal-case text-[var(--fg-disabled)]">(optional)</span></label>
              <input name="mvpDeadline" type="date" className="field-input" />
            </div>
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <SubmitButton pendingText="Creating…" className="btn-cta">
              Create Project
            </SubmitButton>
          </DialogFooter>
        </form>
      </AppDialog>
    </>
  );
}
