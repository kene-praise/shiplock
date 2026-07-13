import { AppSidebar } from "@/components/layout/AppSidebar";
import { DialogDemo } from "./dialog-demo";

// Temporary shell preview for layout verification — safe to delete.
export default function ShellPreviewPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] p-2 gap-1">
      <AppSidebar
        org="shiplock"
        project="digital-encode-grc"
        projectName="Digital Encode GRC"
        orgName="ShipLock"
        allProjects={[
          { slug: "digital-encode-grc", name: "Digital Encode GRC", status: "active" },
          { slug: "acme-delivery", name: "Acme Delivery Q3", status: "paused" },
        ]}
      />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="min-h-full w-full max-w-[1100px] mx-auto px-8 py-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 min-h-8">
            <h1 className="text-[14px] font-semibold tracking-tight text-[var(--fg)] leading-none">Tasks</h1>
            <p className="text-[11.5px] text-[var(--fg-muted)] leading-none">24/41 complete · 59%</p>
            <div className="ml-auto btn-cta !h-8 !px-3.5 !text-[12.5px]">New Task</div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] h-24" />
            ))}
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] h-64" />
          <DialogDemo />
        </div>
      </main>
    </div>
  );
}
