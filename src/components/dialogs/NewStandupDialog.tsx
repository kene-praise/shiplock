"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import { Plus } from "@/components/icons";

interface Props {
  action: (formData: FormData) => Promise<void>;
  todayFormatted: string;
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

export function NewStandupDialog({ action, todayFormatted }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-cta !h-8 !px-3.5 !text-[12.5px]">
        <Plus size={13} /> Today&apos;s Standup
      </button>

      <AppDialog open={open} onClose={() => setOpen(false)} title="Today's Standup" description={todayFormatted}>
        <form action={action} className="flex flex-col min-h-0">
          <FormWatcher onSuccess={() => setOpen(false)} />
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="field-label block">What did you do yesterday?</label>
              <textarea
                name="didYesterday"
                rows={3}
                required
                placeholder="Tasks completed, PRs merged, meetings attended..."
                className="field-input resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="field-label block">What are you doing today?</label>
              <textarea
                name="doingToday"
                rows={3}
                required
                placeholder="Tasks planned, features to ship..."
                className="field-input resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="field-label block">
                Any blockers? <span className="font-normal normal-case text-[var(--fg-disabled)]">(optional)</span>
              </label>
              <textarea
                name="blockers"
                rows={2}
                placeholder="Anything blocking your progress today?"
                className="field-input resize-none"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <SubmitButton pendingText="Submitting…" className="btn-cta">
              Submit Standup
            </SubmitButton>
          </DialogFooter>
        </form>
      </AppDialog>
    </>
  );
}
