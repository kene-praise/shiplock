import { db } from "@/db";
import { demoVideos, projects, requirements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Video, Plus, CheckCircle2, Clock, XCircle, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { sendDemoToClient } from "@/lib/actions/demos";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

const statusConfig = {
  pending:     { label: "Awaiting Review", color: "text-yellow-400 bg-yellow-500/10", icon: Clock },
  approved:    { label: "Approved",        color: "text-green-400 bg-green-500/10",   icon: CheckCircle2 },
  rejected:    { label: "Rejected",        color: "text-red-400 bg-red-500/10",       icon: XCircle },
  no_response: { label: "No Response",     color: "text-zinc-400 bg-zinc-500/10",     icon: Clock },
};

export default async function DemosPage({ params }: Props) {
  const { org, project } = await params;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const demos = await db
    .select({
      demo: demoVideos,
      reqRefCode: requirements.refCode,
      reqTitle: requirements.title,
    })
    .from(demoVideos)
    .leftJoin(requirements, eq(demoVideos.requirementId, requirements.id))
    .where(eq(demoVideos.projectId, projectData.id))
    .orderBy(demoVideos.recordedAt);

  const pending = demos.filter((d) => d.demo.clientStatus === "pending" && d.demo.sentToClient).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Demo Videos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {demos.length} recorded · {pending} awaiting client review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${org}/${project}/dod`}
            className="text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-md transition-colors"
          >
            View DoD
          </Link>
          <Link
            href={`/${org}/${project}/demos/new`}
            className="flex items-center gap-1.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Demo
          </Link>
        </div>
      </div>

      {demos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <Video className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No demo videos yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add a demo recording and link it to the feature it demonstrates.
          </p>
          <Link
            href={`/${org}/${project}/demos/new`}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Add your first demo →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {demos.map(({ demo, reqRefCode, reqTitle }) => {
            const sCfg = statusConfig[demo.clientStatus as keyof typeof statusConfig];
            const Icon = sCfg?.icon ?? Clock;
            const sendAction = sendDemoToClient.bind(null, demo.id, org, project);

            return (
              <div key={demo.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Video className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <a
                        href={demo.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {demo.title}
                      </a>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Recorded {formatDate(demo.recordedAt)}
                        {demo.durationSeconds &&
                          ` · ${Math.floor(demo.durationSeconds / 60)}m ${demo.durationSeconds % 60}s`}
                      </p>
                      {reqRefCode && (
                        <p className="text-xs text-primary/70 mt-1 font-mono">
                          {reqRefCode} · {reqTitle}
                        </p>
                      )}
                      {demo.clientComment && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          &ldquo;{demo.clientComment}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {sCfg && demo.sentToClient && (
                      <span className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", sCfg.color)}>
                        <Icon className="h-3 w-3" />
                        {sCfg.label}
                      </span>
                    )}
                    {!demo.sentToClient && (
                      <form action={sendAction}>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 hover:bg-primary/10 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <Send className="h-3 w-3" />
                          Send to client
                        </button>
                      </form>
                    )}
                    {demo.sentAt && (
                      <p className="text-[10px] text-muted-foreground">
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
    </div>
  );
}
