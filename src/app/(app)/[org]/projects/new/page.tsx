import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProject } from "@/lib/actions/projects";
import { SubmitButton } from "@/components/submit-button";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ org: string }>;
}

export default async function NewProjectPage({ params }: Props) {
  const { org } = await params;

  const [orgData] = await db.select().from(organizations).where(eq(organizations.slug, org)).limit(1);
  if (!orgData) notFound();

  const action = createProject.bind(null, orgData.id, org);

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-6">
        <Link href={`/${org}/projects`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Projects
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-foreground">New Project</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Set up a new client project to start protecting deliveries.</p>
        </div>

        <form action={action} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Project Name</label>
            <input name="name" required placeholder="e.g. Acme Corp Mobile App" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description <span className="normal-case text-muted-foreground/60">(optional)</span></label>
            <textarea name="description" rows={3} placeholder="Brief description of what you're building for this client..." className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">MVP Deadline <span className="normal-case text-muted-foreground/60">(optional)</span></label>
            <input name="mvpDeadline" type="date" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton
              pendingText="Creating…"
              className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-sm font-medium transition-colors"
            >
              Create Project
            </SubmitButton>
            <Link href={`/${org}/projects`} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground text-sm font-medium transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
