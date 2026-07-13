import Link from "next/link";
import { db } from "@/db";
import { projects, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Clock } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NewProjectDialog } from "@/components/dialogs/NewProjectDialog";
import { createProject } from "@/lib/actions/projects";

interface ProjectsPageProps {
  params: Promise<{ org: string }>;
}

const statusTone: Record<string, StatusTone> = {
  active: "approved",
  paused: "pending",
  completed: "auto",
  archived: "neutral",
};

function StatusDot({ status }: { status: string }) {
  const color =
    status === "active" ? "var(--success)"
    : status === "paused" ? "var(--warning)"
    : status === "completed" ? "var(--accent)"
    : "var(--fg-disabled)";
  return <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />;
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { org } = await params;

  const [orgData] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, org))
    .limit(1);

  const projectList = orgData
    ? await db.select().from(projects).where(eq(projects.orgId, orgData.id))
    : [];

  const active = projectList.filter((p) => p.status === "active").length;

  const allProjects = projectList.map((p) => ({
    slug: p.slug,
    name: p.name,
    status: p.status,
    description: p.description,
  }));

  const createAction = orgData
    ? createProject.bind(null, orgData.id, org)
    : undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] p-2 gap-1">
      <AppSidebar org={org} orgName={orgData?.name} allProjects={allProjects} />

      <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-8 py-6">
            {/* Page heading */}
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-[20px] font-semibold tracking-tight text-[var(--fg)] leading-none mb-1.5">
                  Projects
                </h1>
                <p className="text-[13px] text-[var(--fg-muted)]">
                  {projectList.length === 0
                    ? "No projects yet"
                    : `${projectList.length} project${projectList.length !== 1 ? "s" : ""} · ${active} active`}
                </p>
              </div>
              {createAction && <NewProjectDialog action={createAction} />}
            </div>

            {projectList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[var(--border)] rounded-[var(--radius-lg)]">
                <p className="text-[13px] font-medium text-[var(--fg)]">No projects yet</p>
                <p className="text-[12px] text-[var(--fg-muted)] mt-1 max-w-[260px]">
                  Create your first project to start protecting your deliveries.
                </p>
                {createAction && <div className="mt-5"><NewProjectDialog action={createAction} /></div>}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projectList.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/${org}/${p.slug}/dashboard`}
                    className="group flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden hover:border-[var(--border-strong)] transition-colors animate-enter"
                    style={{ "--stagger": i } as React.CSSProperties}
                  >
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusDot status={p.status} />
                        <span className="text-[13.5px] font-semibold text-[var(--fg)] truncate leading-tight">
                          {p.name}
                        </span>
                      </div>
                      {p.description ? (
                        <p className="text-[12px] text-[var(--fg-muted)] leading-relaxed line-clamp-2">
                          {p.description}
                        </p>
                      ) : (
                        <p className="text-[12px] text-[var(--fg-disabled)] italic">No description</p>
                      )}
                    </div>
                    <div
                      className="flex items-center justify-between px-4 py-2.5"
                      style={{ background: "var(--card-footer)", borderTop: "1px solid var(--border-footer)" }}
                    >
                      <StatusBadge tone={statusTone[p.status] ?? "neutral"}>
                        <span className="capitalize">{p.status}</span>
                      </StatusBadge>
                      {p.mvpDeadline && (
                        <span className="flex items-center gap-1 text-[11px] text-[var(--fg-muted)] tabular-nums">
                          <Clock size={11} />
                          {formatDate(p.mvpDeadline)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}

                {createAction && (
                  <div
                    className="animate-enter"
                    style={{ "--stagger": projectList.length } as React.CSSProperties}
                  >
                    <NewProjectDialog action={createAction} asCard />
                  </div>
                )}
              </div>
            )}
          </div>
      </main>
    </div>
  );
}
