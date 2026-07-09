import Link from "next/link";
import { db } from "@/db";
import { projects, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Lock, Plus, Clock, CheckCircle2, PauseCircle, Archive } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProjectsPageProps {
  params: Promise<{ org: string }>;
}

const statusIcon = {
  active: CheckCircle2,
  paused: PauseCircle,
  completed: CheckCircle2,
  archived: Archive,
};

const statusColor = {
  active: "text-green-400",
  paused: "text-yellow-400",
  completed: "text-indigo-400",
  archived: "text-zinc-500",
};

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { org } = await params;

  const [orgData] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, org))
    .limit(1);

  const projectList = orgData
    ? await db
        .select()
        .from(projects)
        .where(eq(projects.orgId, orgData.id))
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Lock className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">ShipLock</span>
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-sm text-muted-foreground">{orgData?.name ?? org}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/${org}/settings`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Settings
          </Link>
          <Link
            href={`/${org}/projects/new`}
            className="flex items-center gap-1.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projectList.length} project{projectList.length !== 1 ? "s" : ""} in {orgData?.name ?? org}
          </p>
        </div>

        {projectList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No projects yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first project to start protecting deliveries.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectList.map((p) => {
              const Icon = statusIcon[p.status] ?? CheckCircle2;
              const color = statusColor[p.status] ?? "text-zinc-500";
              return (
                <Link
                  key={p.id}
                  href={`/${org}/${p.slug}/dashboard`}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Lock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-lg mt-0.5">{p.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 ml-4">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                      <span className={`text-xs font-medium capitalize ${color}`}>{p.status}</span>
                    </div>
                    {p.mvpDeadline && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs">{formatDate(p.mvpDeadline)}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
