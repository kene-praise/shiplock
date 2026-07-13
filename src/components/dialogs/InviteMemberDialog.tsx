"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import type { InviteState } from "@/lib/actions/invites.types";

interface Props {
  action: (prev: InviteState, fd: FormData) => Promise<InviteState>;
}

export function InviteMemberDialog({ action }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "ok" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[var(--accent)] hover:underline"
      >
        Invite member
      </button>

      <AppDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Invite member"
        description="Send an email invite to add someone to this workspace."
      >
        <form ref={formRef} action={formAction} className="flex flex-col min-h-0">
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="field-label block">Email</label>
              <input
                name="email"
                type="email"
                required
                autoFocus
                placeholder="teammate@example.com"
                className="field-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Role</label>
              <select name="role" defaultValue="client" className="field-input">
                <option value="client">Client</option>
                <option value="builder">Builder</option>
              </select>
            </div>

            {state && "error" in state && (
              <p className="text-sm text-[var(--danger)] bg-[var(--danger-muted)] border border-[var(--danger)]/30 rounded-lg px-3 py-2">
                {state.error}
              </p>
            )}
            {state && "ok" in state && (
              <p className="text-sm text-[var(--success)] bg-[var(--success-muted)] border border-[var(--success)]/30 rounded-lg px-3 py-2">
                {state.ok}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Close
            </button>
            <SubmitButton pendingText="Sending…" className="btn-cta">
              Send invite
            </SubmitButton>
          </DialogFooter>
        </form>
      </AppDialog>
    </>
  );
}
