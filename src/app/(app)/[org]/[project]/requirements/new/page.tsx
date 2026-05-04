import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createRequirement } from "@/lib/actions/requirements";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function NewRequirementPage({ params }: Props) {
  const { org, project } = await params;
  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();
  const action = createRequirement.bind(null, projectData.id, org, project);

  return (
    <div className="p-6 max-w-xl space-y-6">
      <Link href={`/${org}/${project}/requirements`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Requirements
      </Link>

      <div>
        <h1 className="text-xl font-bold text-foreground">Add Requirement</h1>
        <p className="text-sm text-muted-foreground mt-0.5">A ref code (REQ-xxx) will be assigned automatically.</p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</label>
          <input name="title" required placeholder="Short, specific requirement title" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
          <textarea name="description" rows={4} required placeholder="Full description of what needs to be built..." className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Classification</label>
            <select name="classification" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition">
              <option value="mvp">MVP</option>
              <option value="post_mvp">Post-MVP</option>
              <option value="out_of_scope">Out of Scope</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source</label>
            <select name="source" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition">
              <option value="meeting">Meeting</option>
              <option value="document">Document</option>
              <option value="email">Email</option>
              <option value="verbal">Verbal</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source Detail <span className="normal-case text-muted-foreground/60">(optional)</span></label>
          <input name="sourceDetail" placeholder="e.g. Kickoff call 2025-04-01, requirements doc v2" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors">
            Add Requirement
          </button>
          <Link href={`/${org}/${project}/requirements`} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground text-sm font-medium transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
