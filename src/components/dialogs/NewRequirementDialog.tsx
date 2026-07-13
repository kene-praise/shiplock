"use client";

import { useState } from "react";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";
import { SubmitButton } from "@/components/submit-button";
import { Plus } from "@/components/icons";

interface Props {
  action: (formData: FormData) => Promise<void>;
}

export function NewRequirementDialog({ action }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-cta !h-8 !px-3.5 !text-[12.5px]">
        <Plus size={13} /> Add
      </button>

      <AppDialog open={open} onClose={() => setOpen(false)} title="Add Requirement" description="A ref code (REQ-xxx) will be assigned automatically.">
        <form action={action} className="flex flex-col min-h-0">
          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="field-label block">Title</label>
              <input name="title" required autoFocus placeholder="Short, specific requirement title" className="field-input" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Description</label>
              <textarea name="description" rows={3} required placeholder="Full description of what needs to be built..." className="field-input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="field-label block">Classification</label>
                <select name="classification" className="field-input">
                  <option value="mvp">MVP</option>
                  <option value="post_mvp">Post-MVP</option>
                  <option value="out_of_scope">Out of Scope</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label block">Source</label>
                <select name="source" className="field-input">
                  <option value="meeting">Meeting</option>
                  <option value="document">Document</option>
                  <option value="email">Email</option>
                  <option value="verbal">Verbal</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Source Detail <span className="font-normal normal-case text-[var(--fg-disabled)]">(optional)</span></label>
              <input name="sourceDetail" placeholder="e.g. Kickoff call 2025-04-01" className="field-input" />
            </div>
          </DialogBody>
          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <SubmitButton pendingText="Adding…" className="btn-cta">
              Add Requirement
            </SubmitButton>
          </DialogFooter>
        </form>
      </AppDialog>
    </>
  );
}
