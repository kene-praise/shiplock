import Link from "next/link";
import { db } from "@/db";
import { demoVideos, projects, requirements } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Video, Send } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import { createDemo, sendDemoToClient, deleteDemoVideo } from "@/lib/actions/demos";
import { PageHeader, SecondaryLink } from "@/components/dashboard-ui";
import { NewDemoDialog } from "@/components/dialogs/NewDemoDialog";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";

import { ViewDemoDialog } from "@/components/dialogs/ViewDemoDialog";

interface DemosPageProps {
  params: Promise<{ org: string; project: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const statusConfig: Record<string, { label: string; tone: StatusTone }> = {
  pending:     { label: "Awaiting Review", tone: "pending" },
  approved:    { label: "Approved",        tone: "approved" },
  rejected:    { label: "Rejected",        tone: "blocked" },
  no_response: { label: "No Response",     tone: "neutral" },
};

export default async function DemosPage({ params, searchParams }: DemosPageProps) {
  const { org, project } = await params;
  const sParams = await searchParams;
  const selectedDemoId = typeof sParams.demo === "string" ? sParams.demo : undefined;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const [demos, allReqs] = await Promise.all([
    db.select({
      demo: demoVideos,
      reqRefCode: requirements.refCode,
      reqTitle: requirements.title,
    })
    .from(demoVideos)
    .leftJoin(requirements, eq(demoVideos.requirementId, requirements.id))
    .where(eq(demoVideos.projectId, projectData.id))
    .orderBy(demoVideos.recordedAt),
    db.select({ id: requirements.id, refCode: requirements.refCode, title: requirements.title, classification: requirements.classification })
      .from(requirements)
      .where(eq(requirements.projectId, projectData.id))
      .orderBy(asc(requirements.refCode)),
  ]);

  const pending = demos.filter((d) => d.demo.clientStatus === "pending" && d.demo.sentToClient).length;
  const selectedDemo = selectedDemoId ? demos.find((d) => d.demo.id === selectedDemoId)?.demo : null;
  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-full w-full max-w-[1100px] mx-auto px-8 py-6 flex flex-col gap-4">
      <PageHeader title="Demo Videos" meta={`${demos.length} recorded · ${pending} awaiting client review`}>
        <SecondaryLink href={`/${org}/${project}/dod`}>View DoD</SecondaryLink>
        <NewDemoDialog
          action={createDemo.bind(null, projectData.id, org, project)}
          reqs={allReqs}
          todayISO={todayISO}
        />
      </PageHeader>

      {demos.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center py-24 text-center animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
          <div
            className="w-11 h-11 rounded-[var(--radius-lg)] bg-[var(--component-fill)] border border-[var(--border)] flex items-center justify-center mb-4"
            style={{ outline: "1px solid var(--border)", outlineOffset: "2px" }}
          >
            <Video className="h-5 w-5 text-[var(--fg-muted)]" />
          </div>
          <p className="text-[13px] font-medium text-[var(--fg)]">No demo videos yet</p>
          <p className="text-[11px] text-[var(--fg-muted)] mt-1">
            Add a demo recording and link it to the feature it demonstrates.
          </p>
          <div className="mt-4">
            <NewDemoDialog action={createDemo.bind(null, projectData.id, org, project)} reqs={allReqs} todayISO={todayISO} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
          {demos.map(({ demo, reqRefCode, reqTitle }) => {
            const sCfg = statusConfig[demo.clientStatus as keyof typeof statusConfig];
            const sendAction = sendDemoToClient.bind(null, demo.id, org, project);

            return (
              <div key={demo.id} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-[border-color,box-shadow] duration-150 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span
                      className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--component-fill)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--fg-muted)]"
                      style={{ outline: "1px solid var(--border)", outlineOffset: "2px" }}
                    >
                      <Video className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/${org}/${project}/demos?demo=${demo.id}`}
                        className="text-[13px] font-medium text-[var(--fg)] hover:text-[var(--accent)] transition-colors truncate block"
                      >
                        {demo.title}
                      </Link>
                      <p className="text-[11.5px] text-[var(--fg-muted)] mt-0.5 tabular-nums">
                        Recorded {formatDate(demo.recordedAt)}
                        {demo.durationSeconds &&
                          ` · ${Math.floor(demo.durationSeconds / 60)}m ${demo.durationSeconds % 60}s`}
                      </p>
                      {reqRefCode && (
                        <p className="text-[11px] mt-1.5 flex items-center gap-1.5">
                          <span className="ref-code">{reqRefCode}</span>
                          <span className="text-[var(--fg-secondary)] truncate">{reqTitle}</span>
                        </p>
                      )}
                      {demo.clientComment && (
                        <p className="text-[12px] text-[var(--fg-muted)] mt-1 italic">
                          &ldquo;{demo.clientComment}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex gap-2 items-center">
                      <form action={deleteDemoVideo.bind(null, demo.id, org, project)}>
                        <button
                          type="submit"
                          className="text-[11.5px] text-[var(--danger)] hover:underline transition-colors"
                          title="Delete Demo"
                        >
                          Delete
                        </button>
                      </form>
                      {!demo.sentToClient && (
                        <form action={sendAction}>
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--accent)] bg-[var(--accent-muted)] hover:bg-[var(--accent)] hover:text-white px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors"
                          >
                            <Send className="h-3 w-3" />
                            Send to client
                          </button>
                        </form>
                      )}
                    </div>
                    {sCfg && demo.sentToClient && (
                      <StatusBadge tone={sCfg.tone}>{sCfg.label}</StatusBadge>
                    )}
                    {demo.sentAt && (
                      <p className="text-[10px] text-[var(--fg-muted)] tabular-nums">
                        Sent {formatDate(demo.sentAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedDemo && (
        <ViewDemoDialog
          title={selectedDemo.title}
          videoUrl={selectedDemo.videoUrl}
          onCloseUrl={`/${org}/${project}/demos`}
        />
      )}
    </div>
  );
}
