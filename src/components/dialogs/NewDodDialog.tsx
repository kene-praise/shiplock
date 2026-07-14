"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import { Plus } from "@/components/icons";

interface Props {
  action: (formData: FormData) => Promise<void>;
  requirements: { id: string; refCode: string; title: string }[];
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

export function NewDodDialog({ action, requirements }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-cta !h-8 !px-3.5 !text-[12.5px]">
        <Plus size={13} /> New Criterion
      </button>

      <AppDialog open={open} onClose={() => setOpen(false)} title="New DoD Criterion" description="Add an acceptance criterion for this project.">
        <form action={action} className="flex flex-col min-h-0">
          <FormWatcher onSuccess={() => setOpen(false)} />
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="field-label block">Requirement</label>
              <select name="requirementId" required className="field-input">
                {requirements.map((r) => (
                  <option key={r.id} value={r.id}>{r.refCode} — {r.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Criterion</label>
              <input name="criterion" required autoFocus placeholder="What must be true to call this done?" className="field-input" />
            </div>
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <SubmitButton pendingText="Creating…" className="btn-cta">
              Create Criterion
            </SubmitButton>
          </DialogFooter>
        </form>
      </AppDialog>
    </>
  );
}
