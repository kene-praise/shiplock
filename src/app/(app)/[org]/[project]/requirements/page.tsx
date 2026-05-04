import Link from "next/link";
import { db } from "@/db";
import { requirements, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { FileCheck, Plus, Upload } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RequirementsPageProps {
  params: Promise<{ org: string; project: string }>;
}

const classificationColors = {
  mvp: "bg-indigo-950 text-indigo-400 border-indigo-800",
  post_mvp: "bg-zinc-800 text-zinc-400 border-zinc-700",
  out_of_scope: "bg-red-950/50 text-red-500 border-red-900/50",
};

const statusColors = {
  draft: "bg-zinc-800 text-zinc-400",
  pending_approval: "bg-yellow-950 text-yellow-400",
  approved: "bg-green-950 text-green-400",
  disputed: "bg-orange-950 text-orange-400",
};

export default async function RequirementsPage({ params }: RequirementsPageProps) {
  const { org, project } = await params;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const reqs = await db
    .select()
    .from(requirements)
    .where(eq(requirements.projectId, projectData.id))
    .orderBy(requirements.refCode);

  const mvpCount = reqs.filter((r) => r.classification === "mvp").length;
  const approvedCount = reqs.filter((r) => r.status === "approved").length;
  const pendingCount = reqs.filter((r) => r.status === "pending_approval").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Requirements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {reqs.length} total · {mvpCount} MVP · {approvedCount} approved · {pendingCount} pending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${org}/${project}/requirements/import`}
            className="flex items-center gap-1.5 text-sm border border-border bg-card hover:bg-accent px-3 py-1.5 rounded-md transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Import
          </Link>
          <Link
            href={`/${org}/${project}/requirements/new`}
            className="flex items-center gap-1.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Link>
        </div>
      </div>

      {reqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileCheck className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No requirements yet</p>
          <p className="text-xs text-muted-foreground mt-1">Import a document or add requirements manually.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Ref</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Classification</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Source</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Approved</th>
              </tr>
            </thead>
            <tbody>
              {reqs.map((req) => (
                <tr key={req.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/${org}/${project}/requirements/${req.id}`}>
                      <span className="ref-code hover:text-primary transition-colors">{req.refCode}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/${org}/${project}/requirements/${req.id}`} className="text-foreground hover:text-primary transition-colors font-medium">
                      {req.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${classificationColors[req.classification]}`}>
                      {req.classification === "post_mvp" ? "Post-MVP" : req.classification === "out_of_scope" ? "Out of Scope" : "MVP"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status]}`}>
                      {req.status === "pending_approval" ? "Pending" : req.autoApproved ? "Auto-Approved" : req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground capitalize">{req.source}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">
                      {req.clientApprovedAt ? formatDate(req.clientApprovedAt) : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
