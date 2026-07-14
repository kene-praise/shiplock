"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import { Plus } from "@/components/icons";
import type { FormState } from "@/lib/actions/form-state";

interface Props {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
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

export function NewScopeChangeDialog({ action }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, null);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-cta !h-8 !px-3.5 !text-[12.5px]">
        <Plus size={13} /> Log Change
      </button>

      <AppDialog open={open} onClose={() => setOpen(false)} title="Log Scope Change" description="Record any new client request not in the original scope." width="lg">
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
              <input name="title" required autoFocus placeholder="Brief description of the change" className="field-input" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Description</label>
              <textarea name="description" rows={2} required placeholder="What did the client ask for?" className="field-input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="field-label block">Source</label>
                <select name="source" className="field-input">
                  <option value="client_request">Client Request</option>
                  <option value="meeting">Meeting</option>
                  <option value="internal">Internal</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label block">Est. Days Impact</label>
                <input name="estimatedDays" type="number" min="0" placeholder="0" className="field-input" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Source Detail</label>
              <input name="sourceDetail" placeholder="e.g. WhatsApp from CEO, 2025-04-08" className="field-input" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Impact Description</label>
              <textarea name="impactDescription" rows={2} required placeholder="What does this mean for timeline, budget, or effort?" className="field-input resize-none" />
            </div>
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <SubmitButton pendingText="Logging…" className="btn-cta">
              Log Scope Change
            </SubmitButton>
          </DialogFooter>
        </form>
      </AppDialog>
    </>
  );
}
