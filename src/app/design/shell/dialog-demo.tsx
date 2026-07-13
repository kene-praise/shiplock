"use client";

import { useState } from "react";
import { AppDialog, DialogBody, DialogFooter } from "@/components/ui/app-dialog";

// Temporary: exercises AppDialog inside an animate-enter container. Safe to delete.
export function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="animate-enter" style={{ "--stagger": 2 } as React.CSSProperties}>
      <button onClick={() => setOpen(true)} className="btn-cta !h-8 !px-3.5 !text-[12.5px]" data-testid="open-dialog">
        Open test dialog
      </button>
      <AppDialog open={open} onClose={() => setOpen(false)} title="New Task" description="A ref code will be assigned automatically.">
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <label className="field-label block">Title</label>
            <input placeholder="What needs to be done?" className="field-input" />
          </div>
          <div className="space-y-1.5">
            <label className="field-label block">Description</label>
            <textarea rows={2} placeholder="Additional context..." className="field-input resize-none" />
          </div>
        </DialogBody>
        <DialogFooter>
          <button onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
          <button className="btn-cta">Create Task</button>
        </DialogFooter>
      </AppDialog>
    </div>
  );
}
